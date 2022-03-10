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
    let durationIndex = index.toI32();
    let reward = stakingContract.rewardCapForDuration(durationIndex);
    let totalRewardsDistributed = stakingContract.totalRewardsDistributedForDuration(durationIndex);
    let staked = stakingContract.totalTokensStakedInDuration(durationIndex);
    let totalStaked = stakingContract.tokensStakedInDuration(durationIndex);
    let duration = stakingContract.durations(durationIndex);
    let contractAddress = stakingContract._address;
    let id = getStakingLockupId(contractAddress.toHex().toLowerCase(), duration.toString())
    let stakingObject = Staking.load(id);
    if (!stakingObject) {
        stakingObject = new Staking(id);
        stakingObject.contractAddress = contractAddress.toHex().toLowerCase();
    }
    stakingObject.staked = staked;
    stakingObject.totalStaked = totalStaked;
    stakingObject.reward = reward;
    stakingObject.durationIndex = index;
    stakingObject.duration = duration;
    stakingObject.totalRewardsDistributed = totalRewardsDistributed;
    stakingObject.save();
}

function getStakingLockupId(address: string, index: string): string {
    return address + '-' + index;
}

export function handleLookUpStake(event: Staked): void {
    let counter = event.params.counter;
    let startTime = event.params.startTime;
    let endTime = event.params.endTime;
    let amount = event.params.amount;
    let user = event.params.user;
    let tokensMinted = event.params.tokensMinted;
    let stakingContract = StakingLockup.bind(event.address);
    let contractAddress = event.address.toHex().toLowerCase();
    let userId = getStakingLockupId(contractAddress, counter.toString() + "-" + user.toHex().toLowerCase());
    let stakingUserObj = StakingUser.load(userId);
    if (!stakingUserObj) {
        stakingUserObj = new StakingUser(userId);
    }
    let duration = endTime.minus(startTime);
    stakingUserObj.address = user.toHex().toLowerCase();
    stakingUserObj.contractAddress = contractAddress;
    stakingUserObj.stakingCounter = counter;
    stakingUserObj.deposit = amount;
    stakingUserObj.reward = tokensMinted.minus(amount)
    stakingUserObj.startTime = startTime;
    stakingUserObj.endTime = endTime;
    stakingUserObj.isActive = true;
    stakingUserObj.duration = duration;
    let id = getStakingLockupId(contractAddress, duration.toString())
    let stakingObj = Staking.load(id);
    if (stakingObj) {
        stakingUserObj.durationIndex = stakingObj.durationIndex;
        let durationIndex = stakingObj.durationIndex.toI32();
        stakingObj.totalRewardsDistributed = stakingContract.totalRewardsDistributedForDuration(durationIndex);
        stakingObj.staked = stakingContract.totalTokensStakedInDuration(durationIndex);
        stakingObj.totalStaked = stakingContract.tokensStakedInDuration(durationIndex);
        stakingObj.save();
    }
    stakingUserObj.save();
}

export function handleClaim(event: Claimed): void {
    let counter = event.params.counter;
    let user = event.params.user;
    let tokensBurned = event.params.tokensBurned;
    let stakingContract = StakingLockup.bind(event.address);
    let contractAddress = event.address.toHex().toLowerCase();
    let userId = getStakingLockupId(contractAddress, counter.toString() + "-" + user.toHex().toLowerCase());
    let stakingUserObj = StakingUser.load(userId);
    if (stakingUserObj) {
        stakingUserObj.withdrawn = tokensBurned;
        stakingUserObj.isActive = false;
        let id = getStakingLockupId(contractAddress, stakingUserObj.durationIndex.toString())
        let stakingObj = Staking.load(id);
        if (stakingObj) {
            let durationIndex = stakingObj.durationIndex.toI32();
            stakingObj.staked = stakingContract.totalTokensStakedInDuration(durationIndex);
            stakingObj.totalStaked = stakingContract.tokensStakedInDuration(durationIndex);
            stakingObj.save();
        }
        stakingUserObj.save();
    }
}