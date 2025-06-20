use anchor_lang::prelude::*;

declare_id!("4VsrFAbCpXtZkWGRQJ2nt9cQDF4SKSWRT8Pe8MpJMQns");

#[program]
pub mod voting_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
