import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Stakied Staking Pool Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns pool info with initial values", () => {
            const info = simnet.callReadOnlyFn("stakied-staking-pool", "get-pool-info", [], deployer);
            expect(info.result).toBeOk(Cl.tuple({
                "total-staked": Cl.uint(0),
                "reward-pool": Cl.uint(0),
                "global-reward-index": Cl.uint(0),
                "last-reward-block": Cl.uint(0),
                "paused": Cl.bool(false)
            }));
        });

        it("returns none for non-staker", () => {
            const stake = simnet.callReadOnlyFn("stakied-staking-pool", "get-stake-info",
                [Cl.principal(wallet1)], deployer);
            expect(stake.result).toBeOk(Cl.none());
        });

        it("returns zero pending rewards for non-staker", () => {
            const rewards = simnet.callReadOnlyFn("stakied-staking-pool", "get-pending-rewards",
                [Cl.principal(wallet1)], deployer);
            expect(rewards.result).toBeOk(Cl.uint(0));
        });
    });

    describe("Staking", () => {
        it("stakes SY tokens successfully", () => {
            simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);

            const stake = simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(500000), Cl.uint(200)], wallet1);
            expect(stake.result).toBeOk(Cl.uint(500000));
        });

        it("fails to stake zero amount", () => {
            const stake = simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(0), Cl.uint(200)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(402));
        });

        it("fails with lock duration too short", () => {
            simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);

            const stake = simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(500000), Cl.uint(10)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(407));
        });

        it("fails with lock duration too long", () => {
            simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);

            const stake = simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(500000), Cl.uint(100000)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(407));
        });

        it("fails when pool is paused", () => {
            simnet.callPublicFn("stakied-staking-pool", "set-pool-paused", [Cl.bool(true)], deployer);

            const stake = simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(500000), Cl.uint(200)], wallet1);
            expect(stake.result).toBeErr(Cl.uint(406));
        });
    });

    describe("Unstaking", () => {
        it("fails to unstake before lock expires", () => {
            simnet.callPublicFn("stakied-sy-token", "deposit", [Cl.uint(1000000)], wallet1);
            simnet.callPublicFn("stakied-staking-pool", "stake",
                [Cl.uint(500000), Cl.uint(200)], wallet1);

            const unstake = simnet.callPublicFn("stakied-staking-pool", "unstake", [], wallet1);
            expect(unstake.result).toBeErr(Cl.uint(404));
        });

        it("fails to unstake with no stake", () => {
            const unstake = simnet.callPublicFn("stakied-staking-pool", "unstake", [], wallet2);
            expect(unstake.result).toBeErr(Cl.uint(405));
        });
    });

    describe("Reward Pool", () => {
        it("funds reward pool", () => {
            const fund = simnet.callPublicFn("stakied-staking-pool", "fund-reward-pool",
                [Cl.uint(1000000)], deployer);
            expect(fund.result).toBeOk(Cl.uint(1000000));
        });

        it("fails to fund with zero amount", () => {
            const fund = simnet.callPublicFn("stakied-staking-pool", "fund-reward-pool",
                [Cl.uint(0)], deployer);
            expect(fund.result).toBeErr(Cl.uint(402));
        });
    });

    describe("Admin Functions", () => {
        it("owner can pause/unpause pool", () => {
            const pause = simnet.callPublicFn("stakied-staking-pool", "set-pool-paused",
                [Cl.bool(true)], deployer);
            expect(pause.result).toBeOk(Cl.bool(true));

            const unpause = simnet.callPublicFn("stakied-staking-pool", "set-pool-paused",
                [Cl.bool(false)], deployer);
            expect(unpause.result).toBeOk(Cl.bool(false));
        });

        it("non-owner cannot pause pool", () => {
            const pause = simnet.callPublicFn("stakied-staking-pool", "set-pool-paused",
                [Cl.bool(true)], wallet1);
            expect(pause.result).toBeErr(Cl.uint(400));
        });
    });
});
