import { BigInt } from "@graphprotocol/graph-ts"
import {
  TrancheAddedToProtocol, TrancheATokenMinted, TrancheBTokenMinted,
  TrancheATokenRedemption, TrancheBTokenRedemption, Tranche as TrancheContract
} from "../generated/Tranche/Tranche"
import { Tranche, TrancheUser } from "../generated/schema"

export function handleTrancheAdd(event: TrancheAddedToProtocol): void {
  let trancheNum = event.params.trancheNum;
  let trancheA = event.params.trancheA;
  let trancheB = event.params.trancheB
  let trancheObj = Tranche.load(trancheNum.toHex());
  if (trancheObj == null) {
    trancheObj = newTranche(trancheNum.toString(), trancheA.toHex(), trancheB.toHex())
  }
  // let trancheContract = TrancheContract.bind(event.address);

  trancheObj.save();
}

export function handleBuyTrancheA(event: TrancheATokenMinted): void {
  let trancheNum = event.params.trancheNum;
  let buyer = event.params.buyer;
  let taAmount = event.params.taAmount
  let userId = getUserId(trancheNum.toString(), buyer.toHex().toString())
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
}

export function handleBuyTrancheB(event: TrancheBTokenMinted): void {
  let trancheNum = event.params.trancheNum;
  let buyer = event.params.buyer;
  let tbAmount = event.params.tbAmount
  let userId = getUserId(trancheNum.toString(), buyer.toHex().toString())
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
}

export function handleSellTrancheA(event: TrancheATokenRedemption): void {
  let trancheNum = event.params.trancheNum;
  let burner = event.params.burner;
  let amount = event.params.amount
  let userId = getUserId(trancheNum.toString(), burner.toHex().toString())
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
  let userId = getUserId(trancheNum.toString(), burner.toHex().toString())
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

function getUserId(trancheNum: string, user: string): string {
  return trancheNum + '-' + user;
}

function newTranche(id: string, trancheAAddress: string, trancheBAddress: string): Tranche {
  let trancheObj = new Tranche(id);
  trancheObj.ATrancheAddress = trancheAAddress
  trancheObj.BTrancheAddress = trancheBAddress;
  return trancheObj;
}
