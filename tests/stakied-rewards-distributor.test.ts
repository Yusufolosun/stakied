import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;


describe("Stakied Rewards Distributor Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns initial distribution stats", () => {
            const stats = simnet.callReadOnlyFn("stakied-rewards-distributor", "get-distribution-stats", [], deployer);
            expect(stats.result).toBeOk(Cl.tuple({
                "total-distributed": Cl.uint(0),
                "current-epoch": Cl.uint(0),
                "epoch-length": Cl.uint(1008),
                "paused": Cl.bool(false)
            }));
        });

        it("returns default reward index", () => {
            const index = simnet.callReadOnlyFn("stakied-rewards-distributor", "get-reward-index",
                [Cl.uint(1000)], deployer);
            expect(index.result).toBeOk(Cl.tuple({
                "global-index": Cl.uint(0),
                "total-rewards": Cl.uint(0),
                "last-update": Cl.uint(0)
            }));
        });

        it("returns default user reward state", () => {
            const state = simnet.callReadOnlyFn("stakied-rewards-distributor", "get-user-reward-state",
                [Cl.principal(wallet1), Cl.uint(1000)], deployer);
            expect(state.result).toBeOk(Cl.tuple({
                "user-index": Cl.uint(0),
                "accrued": Cl.uint(0),
                "claimed": Cl.uint(0)
            }));
        });

        it("returns zero pending rewards initially", () => {
            const pending = simnet.callReadOnlyFn("stakied-rewards-distributor", "get-pending-rewards",
                [Cl.principal(wallet1), Cl.uint(1000)], deployer);
            expect(pending.result).toBeOk(Cl.uint(0));
        });
    });

    describe("Reward Distribution", () => {
        it("distributes rewards to maturity", () => {
            const distribute = simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(1000), Cl.uint(500000)], deployer);
            expect(distribute.result).toBeOk(Cl.uint(499999999999999999999999n));
        });

        it("fails to distribute zero amount", () => {
            const distribute = simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(1000), Cl.uint(0)], deployer);
            expect(distribute.result).toBeErr(Cl.uint(802));
        });

        it("fails to distribute to zero maturity", () => {
            const distribute = simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(0), Cl.uint(500000)], deployer);
            expect(distribute.result).toBeErr(Cl.uint(804));
        });

        it("non-owner cannot distribute", () => {
            const distribute = simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(1000), Cl.uint(500000)], wallet1);
            expect(distribute.result).toBeErr(Cl.uint(800));
        });

        it("updates total distributed", () => {
            simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(1000), Cl.uint(500000)], deployer);
            simnet.callPublicFn("stakied-rewards-distributor", "distribute-rewards",
                [Cl.uint(1000), Cl.uint(300000)], deployer);

            const stats = simnet.callReadOnlyFn("stakied-rewards-distributor", "get-distribution-stats", [], deployer);
            expect(stats.result).toBeOk(Cl.tuple({
                "total-distributed": Cl.uint(800000),
                "current-epoch": Cl.uint(0),
                "epoch-length": Cl.uint(1008),
                "paused": Cl.bool(false)
            }));
        });
    });

    describe("User Reward Claims", () => {
        it("fails to claim with no pending rewards", () => {
            const claim = simnet.callPublicFn("stakied-rewards-distributor", "claim-user-rewards",
                [Cl.uint(1000)], wallet1);
            expect(claim.result).toBeErr(Cl.uint(803));
        });

        it("fails to claim when paused", () => {
            simnet.callPublicFn("stakied-rewards-distributor", "set-distributor-paused",
                [Cl.bool(true)], deployer);

            const claim = simnet.callPublicFn("stakied-rewards-distributor", "claim-user-rewards",
                [Cl.uint(1000)], wallet1);
            expect(claim.result).toBeErr(Cl.uint(806));
        });
    });

    describe("Epoch Management", () => {
        it("creates new epoch", () => {
            const create = simnet.callPublicFn("stakied-rewards-distributor", "create-epoch",
                [Cl.uint(1000000)], deployer);
            expect(create.result).toBeOk(Cl.uint(1));
        });

        it("increments epoch counter", () => {
            simnet.callPublicFn("stakied-rewards-distributor", "create-epoch",
                [Cl.uint(1000000)], deployer);
            const create2 = simnet.callPublicFn("stakied-rewards-distributor", "create-epoch",
                [Cl.uint(500000)], deployer);
            expect(create2.result).toBeOk(Cl.uint(2));
        });

        it("fails to create epoch with zero amount", () => {
            const create = simnet.callPublicFn("stakied-rewards-distributor", "create-epoch",
                [Cl.uint(0)], deployer);
            expect(create.result).toBeErr(Cl.uint(802));
        });

        it("non-owner cannot create epoch", () => {
            const create = simnet.callPublicFn("stakied-rewards-distributor", "create-epoch",
                [Cl.uint(1000000)], wallet1);
            expect(create.result).toBeErr(Cl.uint(800));
        });
    });

    describe("Admin Functions", () => {
        it("sets epoch length", () => {
            const set = simnet.callPublicFn("stakied-rewards-distributor", "set-epoch-length",
                [Cl.uint(2016)], deployer);
            expect(set.result).toBeOk(Cl.uint(2016));
        });

        it("fails to set zero epoch length", () => {
            const set = simnet.callPublicFn("stakied-rewards-distributor", "set-epoch-length",
                [Cl.uint(0)], deployer);
            expect(set.result).toBeErr(Cl.uint(802));
        });

        it("pauses and unpauses distributor", () => {
            const pause = simnet.callPublicFn("stakied-rewards-distributor", "set-distributor-paused",
                [Cl.bool(true)], deployer);
            expect(pause.result).toBeOk(Cl.bool(true));

            const unpause = simnet.callPublicFn("stakied-rewards-distributor", "set-distributor-paused",
                [Cl.bool(false)], deployer);
            expect(unpause.result).toBeOk(Cl.bool(false));
        });

        it("non-owner cannot pause", () => {
            const pause = simnet.callPublicFn("stakied-rewards-distributor", "set-distributor-paused",
                [Cl.bool(true)], wallet1);
            expect(pause.result).toBeErr(Cl.uint(800));
        });
    });
});
