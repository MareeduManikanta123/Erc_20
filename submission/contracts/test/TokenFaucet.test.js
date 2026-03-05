const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Token + TokenFaucet", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    const faucet = await Faucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    await (await token.setMinter(await faucet.getAddress())).wait();

    return { owner, user1, user2, token, faucet };
  }

  it("deploys token and faucet with expected initial state", async function () {
    const { owner, token, faucet } = await deployFixture();

    expect(await token.name()).to.equal("Faucet Token");
    expect(await token.symbol()).to.equal("FCT");
    expect(await token.totalSupply()).to.equal(0);

    expect(await faucet.admin()).to.equal(owner.address);
    expect(await faucet.isPaused()).to.equal(false);
    expect(await faucet.token()).to.equal(await token.getAddress());
  });

  it("allows successful claim and emits events", async function () {
    const { user1, token, faucet } = await deployFixture();

    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user1.address, await faucet.FAUCET_AMOUNT(), anyValue);

    const amount = await faucet.FAUCET_AMOUNT();
    expect(await token.balanceOf(user1.address)).to.equal(amount);
    expect(await faucet.totalClaimed(user1.address)).to.equal(amount);
    expect(await faucet.lastClaimAt(user1.address)).to.be.gt(0);
  });

  it("enforces cooldown period between claims", async function () {
    const { user1, faucet } = await deployFixture();

    await faucet.connect(user1).requestTokens();
    await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith("Cooldown period not elapsed");

    await time.increase(24 * 60 * 60);
    await expect(faucet.connect(user1).requestTokens()).to.not.be.reverted;
  });

  it("enforces lifetime claim limit", async function () {
    const { user1, faucet } = await deployFixture();

    const maxClaims = Number((await faucet.MAX_CLAIM_AMOUNT()) / (await faucet.FAUCET_AMOUNT()));
    for (let i = 0; i < maxClaims; i++) {
      await faucet.connect(user1).requestTokens();
      if (i < maxClaims - 1) {
        await time.increase(24 * 60 * 60);
      }
    }

    await time.increase(24 * 60 * 60);
    await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith("Lifetime claim limit reached");
  });

  it("supports pause/unpause and reverts claims when paused", async function () {
    const { owner, user1, faucet } = await deployFixture();

    await expect(faucet.connect(owner).setPaused(true)).to.emit(faucet, "FaucetPaused").withArgs(true);
    await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith("Faucet is paused");

    await faucet.connect(owner).setPaused(false);
    await expect(faucet.connect(user1).requestTokens()).to.not.be.reverted;
  });

  it("allows only admin to pause faucet", async function () {
    const { user1, faucet } = await deployFixture();

    await expect(faucet.connect(user1).setPaused(true)).to.be.revertedWith("Faucet: caller is not admin");
  });

  it("tracks claims independently per user", async function () {
    const { user1, user2, faucet } = await deployFixture();

    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await faucet.totalClaimed(user1.address)).to.equal(await faucet.FAUCET_AMOUNT());
    expect(await faucet.totalClaimed(user2.address)).to.equal(await faucet.FAUCET_AMOUNT());
  });

  it("returns remaining allowance correctly", async function () {
    const { user1, faucet } = await deployFixture();
    const max = await faucet.MAX_CLAIM_AMOUNT();
    const amount = await faucet.FAUCET_AMOUNT();

    expect(await faucet.remainingAllowance(user1.address)).to.equal(max);

    await faucet.connect(user1).requestTokens();
    expect(await faucet.remainingAllowance(user1.address)).to.equal(max - amount);
  });

  it("returns canClaim false when paused/cooldown/limit", async function () {
    const { owner, user1, faucet } = await deployFixture();

    expect(await faucet.canClaim(user1.address)).to.equal(true);

    await faucet.connect(user1).requestTokens();
    expect(await faucet.canClaim(user1.address)).to.equal(false);

    await time.increase(24 * 60 * 60);
    expect(await faucet.canClaim(user1.address)).to.equal(true);

    await faucet.connect(owner).setPaused(true);
    expect(await faucet.canClaim(user1.address)).to.equal(false);
  });

  it("reverts if faucet cannot mint due to max supply", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const supplyToMint = (await token.maxSupply()) - 50n * 10n ** 18n;
    await token.setMinter(owner.address);
    await token.mint(owner.address, supplyToMint);

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    const faucet = await Faucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    await token.setMinter(await faucet.getAddress());

    await expect(faucet.requestTokens()).to.be.revertedWith("Faucet has insufficient token balance");
  });
});
