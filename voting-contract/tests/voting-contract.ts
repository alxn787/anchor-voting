import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingContract } from "../target/types/voting_contract";
import { assert } from "chai";

describe("voting-contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.votingContract as Program<VotingContract>;
  const signer = provider.wallet;

  const pollId = new anchor.BN(1);
  const description = "Who should be the next DAO leader?";
  const candidateName = "Alice";

  let pollPda: anchor.web3.PublicKey;

  it("Initialize Poll", async () => {
    const pollStart = new anchor.BN(Math.floor(Date.now() / 1000));
    const pollEnd = pollStart.add(new anchor.BN(3600)); // +1 hour

    [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .initializePoll(pollId, pollStart, pollEnd, description)
      .accounts({
        signer: signer.publicKey,
        poll: pollPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Poll created:", tx);

    const pollAccount = await program.account.poll.fetch(pollPda);
    console.log(pollAccount);
    assert.equal(pollAccount.description, description);
  });

  it("Initialize Candidate", async () => {

    const [candidatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        pollId.toArrayLike(Buffer, "le", 8),
        Buffer.from(candidateName),
      ],
      program.programId
    );

    const tx = await program.methods
      .initializeCandidate(candidateName, pollId)
      .accounts({
        signer: signer.publicKey,
        poll: pollPda,
        candidate: candidatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Candidate created:", tx);

    const candidateAccount = await program.account.candidate.fetch(candidatePda);
    console.log(candidateAccount);
    assert.equal(candidateAccount.candidateName, candidateName);
    assert.equal(candidateAccount.candidateVotes.toString(), "0");
  });
});
