import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/Tranche/ERC20";
import { Tranche } from "../generated/schema";

export function getBalanceOf(address: Address, userAddress: Address): BigInt {
    return ERC20.bind(address).balanceOf(userAddress);
}
export function getTokenSymbol(address: Address): string {
    return ERC20.bind(address).symbol().toString();
}

export function getTokenName(address: Address): string {
    return ERC20.bind(address).name().toString();
}

export function getUserId(address: string, trancheNum: string, user: string): string {
    return address + '-' + trancheNum + '-' + user;
}
export function getTrancheId(address: string, trancheNum: string): string {
    return address + '-' + trancheNum;
}

export function newTranche(id: string, trancheAAddress: string, trancheBAddress: string): Tranche {
    let trancheObj = new Tranche(id);
    trancheObj.ATrancheAddress = trancheAAddress
    trancheObj.BTrancheAddress = trancheBAddress;
    return trancheObj;
}

export function getTrancheAApy(price: BigInt, rpb: BigInt, blocks: BigInt): BigInt {
    return ((rpb.times(blocks)).div(price)).times(BigInt.fromI32(100))
}