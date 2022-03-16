import { BigInt, Address, log, BigDecimal } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/StakingLockup/ERC20";

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

export const zeroDecimal = new BigDecimal(BigInt.fromI32(0));

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1');
    let bd10 = BigDecimal.fromString('10');
    for (let i = 0; i < decimals; i++) {
        bd = bd.times(bd10);
    }
    return bd;
}
