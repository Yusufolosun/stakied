import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Stakied Oracle Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns zero latest round initially", () => {
            const round = simnet.callReadOnlyFn("stakied-oracle", "get-latest-round", [], deployer);
            expect(round.result).toBeOk(Cl.uint(0));
        });

        it("returns default staleness threshold", () => {
            const threshold = simnet.callReadOnlyFn("stakied-oracle", "get-staleness-threshold", [], deployer);
            expect(threshold.result).toBeOk(Cl.uint(720));
        });

        it("fails to get price for nonexistent feed", () => {
            const price = simnet.callReadOnlyFn("stakied-oracle", "get-price",
                [Cl.stringAscii("SY-STX")], deployer);
            expect(price.result).toBeErr(Cl.uint(604));
        });
    });

    describe("Price Updates", () => {
        it("owner updates price successfully", () => {
            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1500000)], deployer);
            expect(update.result).toBeOk(Cl.uint(1));
        });

        it("increments round on each update", () => {
            simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1500000)], deployer);

            const update2 = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1510000)], deployer);
            expect(update2.result).toBeOk(Cl.uint(2));
        });

        it("fails with zero price", () => {
            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(0)], deployer);
            expect(update.result).toBeErr(Cl.uint(602));
        });

        it("unauthorized user cannot update", () => {
            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1500000)], wallet1);
            expect(update.result).toBeErr(Cl.uint(609));
        });

        it("authorized updater can update", () => {
            simnet.callPublicFn("stakied-oracle", "authorize-updater",
                [Cl.principal(wallet1), Cl.bool(true)], deployer);

            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1500000)], wallet1);
            expect(update.result).toBeOk(true);
        });

        it("rejects excessive price deviation", () => {
            simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("PT-RATE"), Cl.uint(1000000)], deployer);

            // Try to update with >10% deviation
            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("PT-RATE"), Cl.uint(1200000)], deployer);
            expect(update.result).toBeErr(Cl.uint(608));
        });
    });

    describe("Price Reading", () => {
        it("reads price after update", () => {
            simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("SY-STX"), Cl.uint(1500000)], deployer);

            const price = simnet.callReadOnlyFn("stakied-oracle", "get-price",
                [Cl.stringAscii("SY-STX")], deployer);
            expect(price.result).toBeOk(true);
        });

        it("detects stale price", () => {
            simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("STALE"), Cl.uint(1000000)], deployer);

            simnet.mineEmptyBlocks(800); // past staleness threshold

            const price = simnet.callReadOnlyFn("stakied-oracle", "get-price",
                [Cl.stringAscii("STALE")], deployer);
            expect(price.result).toBeErr(Cl.uint(603));
        });

        it("unsafe read returns staleness flag", () => {
            simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("CHECK"), Cl.uint(1000000)], deployer);

            simnet.mineEmptyBlocks(800);

            const price = simnet.callReadOnlyFn("stakied-oracle", "get-price-unsafe",
                [Cl.stringAscii("CHECK")], deployer);
            expect(price.result).toBeOk(true);
        });
    });

    describe("Feed Configuration", () => {
        it("configures feed bounds", () => {
            const config = simnet.callPublicFn("stakied-oracle", "configure-feed",
                [Cl.stringAscii("BOUNDED"), Cl.bool(true), Cl.uint(500000), Cl.uint(2000000)], deployer);
            expect(config.result).toBeOk(Cl.bool(true));
        });

        it("rejects price outside configured bounds", () => {
            simnet.callPublicFn("stakied-oracle", "configure-feed",
                [Cl.stringAscii("BOUNDED"), Cl.bool(true), Cl.uint(500000), Cl.uint(2000000)], deployer);

            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("BOUNDED"), Cl.uint(100000)], deployer);
            expect(update.result).toBeErr(Cl.uint(602));
        });

        it("rejects update on paused feed", () => {
            simnet.callPublicFn("stakied-oracle", "configure-feed",
                [Cl.stringAscii("PAUSED"), Cl.bool(false), Cl.uint(500000), Cl.uint(2000000)], deployer);

            const update = simnet.callPublicFn("stakied-oracle", "update-price",
                [Cl.stringAscii("PAUSED"), Cl.uint(1000000)], deployer);
            expect(update.result).toBeErr(Cl.uint(606));
        });

        it("non-owner cannot configure feed", () => {
            const config = simnet.callPublicFn("stakied-oracle", "configure-feed",
                [Cl.stringAscii("BOUNDED"), Cl.bool(true), Cl.uint(500000), Cl.uint(2000000)], wallet1);
            expect(config.result).toBeErr(Cl.uint(600));
        });
    });

    describe("Admin Functions", () => {
        it("sets staleness threshold", () => {
            const set = simnet.callPublicFn("stakied-oracle", "set-staleness-threshold",
                [Cl.uint(1440)], deployer);
            expect(set.result).toBeOk(Cl.uint(1440));
        });

        it("rejects zero staleness threshold", () => {
            const set = simnet.callPublicFn("stakied-oracle", "set-staleness-threshold",
                [Cl.uint(0)], deployer);
            expect(set.result).toBeErr(Cl.uint(607));
        });
    });
});
