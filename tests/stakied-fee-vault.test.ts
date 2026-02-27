import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Stakied Fee Vault Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns zero vault balance initially", () => {
            const balance = simnet.callReadOnlyFn("stakied-fee-vault", "get-vault-balance", [], deployer);
            expect(balance.result).toBeOk(Cl.uint(0));
        });

        it("returns default fee config", () => {
            const config = simnet.callReadOnlyFn("stakied-fee-vault", "get-fee-config", [], deployer);
            expect(config.result).toBeOk(Cl.tuple({
                "treasury-address": Cl.principal(deployer),
                "treasury-split-bps": Cl.uint(5000),
                "staker-split-bps": Cl.uint(5000),
                "distribution-cooldown": Cl.uint(144),
                "paused": Cl.bool(false)
            }));
        });

        it("returns initial fee stats", () => {
            const stats = simnet.callReadOnlyFn("stakied-fee-vault", "get-fee-stats", [], deployer);
            expect(stats.result).toBeOk(Cl.tuple({
                "total-collected": Cl.uint(0),
                "total-distributed": Cl.uint(0),
                "pending": Cl.uint(0),
                "last-distribution": Cl.uint(0)
            }));
        });
    });

    describe("Fee Collection", () => {
        it("owner collects fees", () => {
            const collect = simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(50000), Cl.principal(wallet1)], deployer);
            expect(collect.result).toBeOk(Cl.uint(50000));
        });

        it("fails to collect zero fees", () => {
            const collect = simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(0), Cl.principal(wallet1)], deployer);
            expect(collect.result).toBeErr(Cl.uint(502));
        });

        it("unauthorized user cannot collect", () => {
            const collect = simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(50000), Cl.principal(wallet1)], wallet1);
            expect(collect.result).toBeErr(Cl.uint(501));
        });

        it("authorized collector can collect", () => {
            simnet.callPublicFn("stakied-fee-vault", "authorize-collector",
                [Cl.principal(wallet1), Cl.bool(true)], deployer);

            const collect = simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(25000), Cl.principal(wallet2)], wallet1);
            expect(collect.result).toBeOk(Cl.uint(25000));
        });
    });

    describe("Fee Distribution", () => {
        it("fails to distribute with no pending fees", () => {
            const distribute = simnet.callPublicFn("stakied-fee-vault", "distribute-fees", [], deployer);
            expect(distribute.result).toBeErr(Cl.uint(507));
        });

        it("distributes fees with correct split", () => {
            simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(100000), Cl.principal(wallet1)], deployer);

            simnet.mineEmptyBlocks(150);

            const distribute = simnet.callPublicFn("stakied-fee-vault", "distribute-fees", [], deployer);
            expect(distribute.result).toBeOk(Cl.tuple({
                "treasury": Cl.uint(50000),
                "stakers": Cl.uint(50000)
            }));
        });

        it("fails during cooldown period", () => {
            simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(100000), Cl.principal(wallet1)], deployer);
            simnet.mineEmptyBlocks(150);
            simnet.callPublicFn("stakied-fee-vault", "distribute-fees", [], deployer);

            simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(50000), Cl.principal(wallet1)], deployer);

            const distribute2 = simnet.callPublicFn("stakied-fee-vault", "distribute-fees", [], deployer);
            expect(distribute2.result).toBeErr(Cl.uint(508));
        });
    });

    describe("Admin Functions", () => {
        it("sets fee split correctly", () => {
            const split = simnet.callPublicFn("stakied-fee-vault", "set-fee-split",
                [Cl.uint(7000), Cl.uint(3000)], deployer);
            expect(split.result).toBeOk(Cl.bool(true));
        });

        it("rejects invalid fee split (not summing to 10000)", () => {
            const split = simnet.callPublicFn("stakied-fee-vault", "set-fee-split",
                [Cl.uint(6000), Cl.uint(3000)], deployer);
            expect(split.result).toBeErr(Cl.uint(506));
        });

        it("non-owner cannot set fee split", () => {
            const split = simnet.callPublicFn("stakied-fee-vault", "set-fee-split",
                [Cl.uint(5000), Cl.uint(5000)], wallet1);
            expect(split.result).toBeErr(Cl.uint(500));
        });

        it("owner can pause vault", () => {
            const pause = simnet.callPublicFn("stakied-fee-vault", "set-vault-paused",
                [Cl.bool(true)], deployer);
            expect(pause.result).toBeOk(Cl.bool(true));
        });

        it("collection fails when paused", () => {
            simnet.callPublicFn("stakied-fee-vault", "set-vault-paused",
                [Cl.bool(true)], deployer);

            const collect = simnet.callPublicFn("stakied-fee-vault", "collect-fee",
                [Cl.uint(50000), Cl.principal(wallet1)], deployer);
            expect(collect.result).toBeErr(Cl.uint(505));
        });
    });
});
