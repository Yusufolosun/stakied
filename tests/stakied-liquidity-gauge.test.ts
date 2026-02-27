import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Stakied Liquidity Gauge Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns initial gauge info", () => {
            const info = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-gauge-info", [], deployer);
            expect(info.result).toBeOk(Cl.tuple({
                "emission-rate": Cl.uint(100),
                "total-staked-lp": Cl.uint(0),
                "total-boosted-supply": Cl.uint(0),
                "global-reward-per-token": Cl.uint(0),
                "last-update-block": Cl.uint(0),
                "paused": Cl.bool(false)
            }));
        });

        it("returns none for non-staker", () => {
            const stake = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-lp-stake",
                [Cl.principal(wallet1)], deployer);
            expect(stake.result).toBeOk(Cl.none());
        });

        it("returns min boost for non-staker", () => {
            const boost = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-boost-factor",
                [Cl.principal(wallet1)], deployer);
            expect(boost.result).toBeOk(Cl.uint(1000000)); // 1.0x
        });

        it("returns zero earned for non-staker", () => {
            const earned = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-earned",
                [Cl.principal(wallet1)], deployer);
            expect(earned.result).toBeOk(Cl.uint(0));
        });
    });

    describe("LP Staking", () => {
        it("stakes LP tokens successfully", () => {
            const stake = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);
            expect(stake.result).toBeOk(Cl.tuple({
                amount: Cl.uint(500000),
                boost: Cl.uint(1000000)
            }));
        });

        it("fails to stake zero amount", () => {
            const stake = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(0), Cl.uint(1000)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(902));
        });

        it("fails to stake with zero maturity", () => {
            const stake = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(0)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(908));
        });

        it("fails when gauge is paused", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "set-gauge-paused",
                [Cl.bool(true)], deployer);

            const stake = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(905));
        });

        it("multiple users can stake", () => {
            const stake1 = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);
            expect(stake1.result).toBeOk(Cl.tuple({
                amount: Cl.uint(500000),
                boost: Cl.uint(1000000)
            }));

            const stake2 = simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(300000), Cl.uint(1000)], wallet2);
            expect(stake2.result).toBeOk(Cl.tuple({
                amount: Cl.uint(300000),
                boost: Cl.uint(1000000)
            }));
        });
    });

    describe("LP Unstaking", () => {
        it("unstakes LP tokens", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            const unstake = simnet.callPublicFn("stakied-liquidity-gauge", "unstake-lp",
                [Cl.uint(200000)], wallet1);
            expect(unstake.result).toBeOk(Cl.uint(200000));
        });

        it("fails to unstake more than staked", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            const unstake = simnet.callPublicFn("stakied-liquidity-gauge", "unstake-lp",
                [Cl.uint(9999999)], wallet1);
            expect(unstake.result).toBeErr(Cl.uint(903));
        });

        it("fails to unstake with no stake", () => {
            const unstake = simnet.callPublicFn("stakied-liquidity-gauge", "unstake-lp",
                [Cl.uint(100)], wallet2);
            expect(unstake.result).toBeErr(Cl.uint(904));
        });

        it("fails to unstake zero amount", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            const unstake = simnet.callPublicFn("stakied-liquidity-gauge", "unstake-lp",
                [Cl.uint(0)], wallet1);
            expect(unstake.result).toBeErr(Cl.uint(902));
        });
    });

    describe("Gauge Rewards", () => {
        it("fails to claim with no rewards", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            const claim = simnet.callPublicFn("stakied-liquidity-gauge", "claim-gauge-rewards", [], wallet1);
            expect(claim.result).toBeErr(Cl.uint(907));
        });

        it("fails to claim with no stake", () => {
            const claim = simnet.callPublicFn("stakied-liquidity-gauge", "claim-gauge-rewards", [], wallet2);
            expect(claim.result).toBeErr(Cl.uint(904));
        });

        it("accrues rewards over blocks", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            simnet.mineEmptyBlocks(100);

            const earned = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-earned",
                [Cl.principal(wallet1)], deployer);
            expect(earned.result).toBeOk(Cl.uint(10000));
        });
    });

    describe("Boost Mechanics", () => {
        it("governance balance increases boost", () => {
            simnet.callPublicFn("stakied-liquidity-gauge", "set-governance-balance",
                [Cl.principal(wallet1), Cl.uint(1000000)], deployer);

            simnet.callPublicFn("stakied-liquidity-gauge", "stake-lp",
                [Cl.uint(500000), Cl.uint(1000)], wallet1);

            const boost = simnet.callReadOnlyFn("stakied-liquidity-gauge", "get-boost-factor",
                [Cl.principal(wallet1)], deployer);
            expect(boost.result).toBeOk(Cl.uint(1000000));
        });

        it("non-owner cannot set governance balance", () => {
            const set = simnet.callPublicFn("stakied-liquidity-gauge", "set-governance-balance",
                [Cl.principal(wallet1), Cl.uint(1000000)], wallet1);
            expect(set.result).toBeErr(Cl.uint(900));
        });
    });

    describe("Admin Functions", () => {
        it("sets emission rate", () => {
            const set = simnet.callPublicFn("stakied-liquidity-gauge", "set-emission-rate",
                [Cl.uint(200)], deployer);
            expect(set.result).toBeOk(Cl.uint(200));
        });

        it("fails to set zero emission rate", () => {
            const set = simnet.callPublicFn("stakied-liquidity-gauge", "set-emission-rate",
                [Cl.uint(0)], deployer);
            expect(set.result).toBeErr(Cl.uint(906));
        });

        it("non-owner cannot set emission rate", () => {
            const set = simnet.callPublicFn("stakied-liquidity-gauge", "set-emission-rate",
                [Cl.uint(200)], wallet1);
            expect(set.result).toBeErr(Cl.uint(900));
        });

        it("pauses and unpauses gauge", () => {
            const pause = simnet.callPublicFn("stakied-liquidity-gauge", "set-gauge-paused",
                [Cl.bool(true)], deployer);
            expect(pause.result).toBeOk(Cl.bool(true));

            const unpause = simnet.callPublicFn("stakied-liquidity-gauge", "set-gauge-paused",
                [Cl.bool(false)], deployer);
            expect(unpause.result).toBeOk(Cl.bool(false));
        });
    });
});
