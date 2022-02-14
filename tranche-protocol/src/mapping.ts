import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  TrancheAddedToProtocol, TrancheATokenMinted, TrancheBTokenMinted,
  TrancheATokenRedemption, TrancheBTokenRedemption, Tranche as TrancheContract
} from "../generated/Tranche/Tranche"
import { ERC20 } from "../generated/Tranche/ERC20";
import { Tranche, TrancheUser, TrancheParams } from "../generated/schema"

export function handleTrancheAdd(event: TrancheAddedToProtocol): void {
  let trancheNum = event.params.trancheNum;
  let trancheA = event.params.trancheA;
  let trancheB = event.params.trancheB
  let trancheObj = Tranche.load(trancheNum.toHex());
  if (trancheObj == null) {
    trancheObj = newTranche(getTrancheId(event.address.toHex().toLowerCase(), trancheNum.toString()), trancheA.toHex().toLowerCase(), trancheB.toHex().toLowerCase())
  }
  let trancheContract = TrancheContract.bind(event.address);
  let trancheAddresses = trancheContract.trancheAddresses(trancheNum);
  trancheObj.buyerCoinAddress = trancheAddresses.value0.toHex().toLowerCase();
  trancheObj.dividendCoinAddress = trancheAddresses.value1.toHex().toLowerCase();
  trancheObj.metaData = trancheMetaData(event, trancheNum, trancheContract).id;
  trancheObj.contractAddress = event.address.toHex().toLowerCase();
  trancheObj.cryptoType = getTokenSymbol(trancheAddresses.value0);
  trancheObj.dividendType = getTokenSymbol(trancheAddresses.value1);
  trancheObj.trancheAValue = trancheContract.getTrAValue(trancheNum);
  trancheObj.trancheBValue = trancheContract.getTrBValue(trancheNum);
  trancheObj.save();
}

function getBalanceOf(address: Address, userAddress: Address): BigInt {
  return ERC20.bind(address).balanceOf(userAddress);
}
function getTokenSymbol(address: Address): string {
  return ERC20.bind(address).symbol();
}

function trancheMetaData(event: TrancheAddedToProtocol, trancheNum: BigInt, trancheContract: TrancheContract): TrancheParams {
  let trParams = new TrancheParams(event.transaction.hash.toHexString());
  let trancheParams = trancheContract.trancheParameters(trancheNum);
  trParams.cTokenDecimals = BigInt.fromI32(trancheParams.value5);
  trParams.underlyingDecimals = BigInt.fromI32(trancheParams.value6);
  trParams.trancheACurrentRPB = trancheParams.value3;
  trParams.save()
  return trParams;
}

export function handleBuyTrancheA(event: TrancheATokenMinted): void {
  let trancheNum = event.params.trancheNum;
  let buyer = event.params.buyer;
  let taAmount = event.params.taAmount
  let userId = getUserId(event.address.toHex().toLowerCase(), trancheNum.toString(), buyer.toHex().toString())
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = buyer.toHex();
    trancheUserObj.trancheNum = trancheNum.toI32();
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheAbalance = trancheUserObj.trancheAbalance.plus(taAmount)
  trancheUserObj.save();
  let trancheObj = Tranche.load(getTrancheId(event.address.toHex().toLowerCase(), trancheNum.toString()));
  let trancheContract = TrancheContract.bind(event.address);
  if (trancheObj) {
    trancheObj.trancheAValue = trancheContract.getTrAValue(trancheNum);
    trancheObj.save();
  }
}

export function handleBuyTrancheB(event: TrancheBTokenMinted): void {
  let trancheNum = event.params.trancheNum;
  let buyer = event.params.buyer;
  let tbAmount = event.params.tbAmount
  let userId = getUserId(event.address.toHex().toLowerCase(), trancheNum.toString(), buyer.toHex().toString())
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = buyer.toHex();
    trancheUserObj.trancheNum = trancheNum.toI32();
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheBbalance = trancheUserObj.trancheBbalance.plus(tbAmount)
  trancheUserObj.save();
  let trancheObj = Tranche.load(getTrancheId(event.address.toHex().toLowerCase(), trancheNum.toString()));
  let trancheContract = TrancheContract.bind(event.address);
  if (trancheObj) {
    trancheObj.trancheBValue = trancheContract.getTrBValue(trancheNum);
    trancheObj.save();
  }
}

export function handleSellTrancheA(event: TrancheATokenRedemption): void {
  let trancheNum = event.params.trancheNum;
  let burner = event.params.burner;
  let amount = event.params.amount
  let userId = getUserId(event.address.toHex().toLowerCase(), trancheNum.toString(), burner.toHex().toString())
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = burner.toHex();
    trancheUserObj.trancheNum = trancheNum.toI32();
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheAbalance = trancheUserObj.trancheAbalance.minus(amount)
  trancheUserObj.save();
}

export function handleSellTrancheB(event: TrancheBTokenRedemption): void {
  let trancheNum = event.params.trancheNum;
  let burner = event.params.burner;
  let amount = event.params.amount
  let userId = getUserId(event.address.toHex().toLowerCase(), trancheNum.toString(), burner.toHex().toString())
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = burner.toHex();
    trancheUserObj.trancheNum = trancheNum.toI32();
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheBbalance = trancheUserObj.trancheBbalance.minus(amount)
  trancheUserObj.save();
}

function getUserId(address: string, trancheNum: string, user: string): string {
  return address + '-' + trancheNum + '-' + user;
}
function getTrancheId(address: string, trancheNum: string): string {
  return address + '-' + trancheNum;
}

function newTranche(id: string, trancheAAddress: string, trancheBAddress: string): Tranche {
  let trancheObj = new Tranche(id);
  trancheObj.ATrancheAddress = trancheAAddress
  trancheObj.BTrancheAddress = trancheBAddress;
  return trancheObj;
}
