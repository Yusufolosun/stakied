import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Stakied Governance Tests", () => {
    describe("Read-Only Functions", () => {
        it("returns zero proposal count initially", () => {
            const count = simnet.callReadOnlyFn("stakied-governance", "get-proposal-count", [], deployer);
            expect(count.result).toBeOk(Cl.uint(0));
        });

        it("returns zero voting power initially", () => {
            const power = simnet.callReadOnlyFn("stakied-governance", "get-voting-power",
                [Cl.principal(wallet1)], deployer);
            expect(power.result).toBeOk(Cl.uint(0));
        });

        it("fails to get nonexistent proposal", () => {
            const prop = simnet.callReadOnlyFn("stakied-governance", "get-proposal",
                [Cl.uint(999)], deployer);
            expect(prop.result).toBeErr(Cl.uint(703));
        });
    });

    describe("Voting Power", () => {
        it("registers voting power", () => {
            const register = simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            expect(register.result).toBeOk(Cl.uint(50000));

            const power = simnet.callReadOnlyFn("stakied-governance", "get-voting-power",
                [Cl.principal(wallet1)], deployer);
            expect(power.result).toBeOk(Cl.uint(50000));
        });

        it("fails to register zero voting power", () => {
            const register = simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(0)], wallet1);
            expect(register.result).toBeErr(Cl.uint(702));
        });
    });

    describe("Proposal Creation", () => {
        it("creates proposal when user has enough power", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);

            const create = simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Increase yield rate"), Cl.stringAscii("Increase base yield rate to 10%")], wallet1);
            expect(create.result).toBeOk(Cl.uint(1));
        });

        it("fails without enough voting power", () => {
            const create = simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Test"), Cl.stringAscii("Test desc")], wallet2);
            expect(create.result).toBeErr(Cl.uint(701));
        });

        it("increments proposal count", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);

            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Prop 1"), Cl.stringAscii("Desc 1")], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Prop 2"), Cl.stringAscii("Desc 2")], wallet1);

            const count = simnet.callReadOnlyFn("stakied-governance", "get-proposal-count", [], deployer);
            expect(count.result).toBeOk(Cl.uint(2));
        });
    });

    describe("Voting", () => {
        it("casts vote successfully", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Yield update"), Cl.stringAscii("Update yield")], wallet1);

            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(30000)], wallet2);

            const vote = simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(true), Cl.uint(25000)], wallet2);
            expect(vote.result).toBeOk(Cl.bool(true));
        });

        it("prevents double voting", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Proposal"), Cl.stringAscii("Description")], wallet1);

            simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(true), Cl.uint(10000)], wallet1);

            const vote2 = simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(false), Cl.uint(5000)], wallet1);
            expect(vote2.result).toBeErr(Cl.uint(705));
        });

        it("fails to vote with zero amount", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Test"), Cl.stringAscii("Test")], wallet1);

            const vote = simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(true), Cl.uint(0)], wallet1);
            expect(vote.result).toBeErr(Cl.uint(702));
        });

        it("fails to vote on expired proposal", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Old prop"), Cl.stringAscii("Expired")], wallet1);

            simnet.mineEmptyBlocks(1100); // past voting period

            const vote = simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(true), Cl.uint(10000)], wallet1);
            expect(vote.result).toBeErr(Cl.uint(704));
        });
    });

    describe("Proposal Execution", () => {
        it("fails to execute before voting ends", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(50000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Active"), Cl.stringAscii("Active prop")], wallet1);

            const exec = simnet.callPublicFn("stakied-governance", "execute-proposal",
                [Cl.uint(1)], deployer);
            expect(exec.result).toBeErr(Cl.uint(704));
        });
    });

    describe("Proposal Cancellation", () => {
        it("proposer can cancel", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Cancel"), Cl.stringAscii("Cancel me")], wallet1);

            const cancel = simnet.callPublicFn("stakied-governance", "cancel-proposal",
                [Cl.uint(1)], wallet1);
            expect(cancel.result).toBeOk(Cl.bool(true));
        });

        it("owner can cancel any proposal", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Owner cancel"), Cl.stringAscii("Desc")], wallet1);

            const cancel = simnet.callPublicFn("stakied-governance", "cancel-proposal",
                [Cl.uint(1)], deployer);
            expect(cancel.result).toBeOk(Cl.bool(true));
        });

        it("random user cannot cancel", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("No cancel"), Cl.stringAscii("Desc")], wallet1);

            const cancel = simnet.callPublicFn("stakied-governance", "cancel-proposal",
                [Cl.uint(1)], wallet2);
            expect(cancel.result).toBeErr(Cl.uint(701));
        });

        it("prevents voting on cancelled proposal", () => {
            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(20000)], wallet1);
            simnet.callPublicFn("stakied-governance", "create-proposal",
                [Cl.stringAscii("Cancelled"), Cl.stringAscii("Desc")], wallet1);
            simnet.callPublicFn("stakied-governance", "cancel-proposal",
                [Cl.uint(1)], wallet1);

            simnet.callPublicFn("stakied-governance", "register-voting-power",
                [Cl.uint(10000)], wallet2);
            const vote = simnet.callPublicFn("stakied-governance", "cast-vote",
                [Cl.uint(1), Cl.bool(true), Cl.uint(5000)], wallet2);
            expect(vote.result).toBeErr(Cl.uint(704));
        });
    });
});
