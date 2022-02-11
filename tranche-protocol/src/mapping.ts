import { BigInt } from "@graphprotocol/graph-ts"
import {
  TrancheAddedToProtocol, TrancheATokenMinted, TrancheBTokenMinted,
  TrancheATokenRedemption, TrancheBTokenRedemption
} from "../generated/Tranche/Tranche"
import { Tranche, TrancheUser } from "../generated/schema"

export function handleTrancheAdd(event: TrancheAddedToProtocol): void {
  let { trancheNum, trancheA, trancheB } = event.params;
  let trancheObj = Tranche.load(trancheNum.toHex());
  if (trancheObj == null) {
    trancheObj = newTranche(trancheNum.toString(), trancheA.toHex(), trancheB.toHex())
  }
  trancheObj.save();
}

export function handleBuyTrancheA(event: TrancheATokenMinted): void {
  let { trancheNum, buyer, taAmount } = event.params;
  let userId = trancheNum + '-' + buyer.toHex()
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = buyer.toHex();
    trancheUserObj.trancheNum = +trancheNum;
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheAbalance = trancheUserObj.trancheAbalance.plus(taAmount)
  trancheUserObj.save();
}

export function handleBuyTrancheB(event: TrancheBTokenMinted): void {
  let { trancheNum, buyer, tbAmount } = event.params;
  let userId = trancheNum + '-' + buyer.toHex()
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = buyer.toHex();
    trancheUserObj.trancheNum = +trancheNum;
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheBbalance = trancheUserObj.trancheBbalance.plus(tbAmount)
  trancheUserObj.save();
}

export function handleSellTrancheA(event: TrancheATokenRedemption): void {
  let { trancheNum, burner, amount } = event.params;
  let userId = trancheNum + '-' + burner.toHex()
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = burner.toHex();
    trancheUserObj.trancheNum = +trancheNum;
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheAbalance = trancheUserObj.trancheAbalance.minus(amount)
  trancheUserObj.save();
}

export function handleSellTrancheB(event: TrancheBTokenRedemption): void {
  let { trancheNum, burner, amount } = event.params;
  let userId = trancheNum + '-' + burner.toHex()
  let trancheUserObj = TrancheUser.load(userId);
  if (trancheUserObj == null) {
    trancheUserObj = new TrancheUser(userId);
    trancheUserObj.address = burner.toHex();
    trancheUserObj.trancheNum = +trancheNum;
    trancheUserObj.trancheAbalance = BigInt.fromI32(0)
    trancheUserObj.trancheBbalance = BigInt.fromI32(0)
  }
  trancheUserObj.trancheBbalance = trancheUserObj.trancheBbalance.minus(amount)
  trancheUserObj.save();
}

function newTranche(id: string, trancheAAddress: string, trancheBAddress: string): Tranche {
  let trancheObj = new Tranche(id);
  trancheObj.ATrancheAddress = trancheAAddress
  trancheObj.BTrancheAddress = trancheBAddress;
  return trancheObj;
}
