import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
    Staked,
    RewardsSet,
    Claimed,
    StakingLockup
} from "../generated/StakingLockup/StakingLockup"
import { Staking, StakingUser } from "../generated/schema";

export function handleRewardSet(event: RewardsSet): void {
    let stakingContract = StakingLockup.bind(event.address);
    let totalDuration = stakingContract.numDurations();
    const durations = new Array<number>(totalDuration).fill(0);
    for (let i = 0; i < durations.length; i++) {
        storeStakingLookup(BigInt.fromI32(i), event);
    }
}

function storeStakingLookup(index: BigInt, event: RewardsSet): void {
    let stakingContract = StakingLockup.bind(event.address);
    let duration = index.toI32();
    let reward = stakingContract.rewardCapForDuration(duration);
    let totalRewardsDistributed = stakingContract.totalRewardsDistributedForDuration(duration);
    let staked = stakingContract.totalTokensStakedInDuration(duration);
    let totalStaked = stakingContract.tokensStakedInDuration(duration);
    let contractAddress = stakingContract._address;
    let id = getStakingLockupId(contractAddress.toHex().toLowerCase(), index.toString())
    let stakingObject = Staking.load(id);
    if (!stakingObject) {
        stakingObject = new Staking(id);
        stakingObject.contractAddress = contractAddress.toHex().toLowerCase();
    }
    stakingObject.staked = staked;
    stakingObject.totalStaked = totalStaked;
    stakingObject.reward = reward;
    stakingObject.duration = index;
    stakingObject.totalRewardsDistributed = totalRewardsDistributed;
    stakingObject.save();
}

function getStakingLockupId(address: string, index: string): string {
    return address + '-' + index;
}

export function handleLookUpStake(event: Staked): void {
}

export function handleClaim(event: Claimed): void {

}