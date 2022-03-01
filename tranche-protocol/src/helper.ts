import { BigInt, Address, log, BigDecimal } from "@graphprotocol/graph-ts"
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

export function getTrancheAApy(price: BigInt, rpb: BigInt, blocks: BigInt): BigDecimal {
    let apyPrice = (rpb.times(blocks).times(BigInt.fromI32(100)));
    let finalAPY = new BigDecimal(apyPrice).div(new BigDecimal(price)).truncate(3)
    log.warning('p' + price.toString() + 'r' + rpb.toString() + 'b' + blocks.toString() + 'c' + apyPrice.toString() + 'd' + finalAPY.toString(), []);
    return finalAPY;
}