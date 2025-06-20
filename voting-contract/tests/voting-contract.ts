import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingContract } from "../target/types/voting_contract";
import { assert } from "chai";

describe("voting-contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.votingContract as Program<VotingContract>;
  const signer = provider.wallet;

  it("Initialize Poll!", async () => {
    const pollId = new anchor.BN(1);
    const pollStart = new anchor.BN(Math.floor(Date.now() / 1000)); // Current time in seconds
    const pollEnd = pollStart.add(new anchor.BN(3600)); // +1 hour
    const description = "Who should be the next DAO leader?";

    // Derive the poll PDA - this should match your Rust seeds exactly
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)], // u64 as little-endian bytes
      program.programId
    );

    console.log("Poll PDA:", pollPda.toString());
    console.log("Program ID:", program.programId.toString());

    try {
      const tx = await program.methods
        .initializePoll(pollId, pollStart, pollEnd, description)
        .accounts({
          signer: signer.publicKey,
          poll: pollPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction Signature:", tx);

      // Fetch and verify the poll account
      const pollAccount = await program.account.poll.fetch(pollPda);
      
      console.log("Poll Account Data:", {
        pollId: pollAccount.pollId.toString(),
        description: pollAccount.description,
        pollStart: pollAccount.pollStart.toString(),
        pollEnd: pollAccount.pollEnd.toString(),
        candidateAmount: pollAccount.candidateAmount.toString()
      });

      // Assertions
      assert.equal(pollAccount.pollId.toString(), pollId.toString());
      assert.equal(pollAccount.description, description);
      assert.equal(pollAccount.pollStart.toString(), pollStart.toString());
      assert.equal(pollAccount.pollEnd.toString(), pollEnd.toString());
      assert.equal(pollAccount.candidateAmount.toString(), "0");

      console.log("✅ Poll initialized successfully!");

    } catch (error) {
      console.error("Error initializing poll:", error);
      throw error;
    }
  });
});