import { BigInt, Address, log, } from "@graphprotocol/graph-ts"
import {
  TrancheAddedToProtocol, TrancheATokenMinted, TrancheBTokenMinted,
  TrancheATokenRedemption, TrancheBTokenRedemption, Tranche as TrancheContract
} from "../generated/Tranche/Tranche";
import { JAave } from "../generated/Tranche/JAave";
import { JCompound } from "../generated/Tranche/JCompound";
import { JYearn } from "../generated/Tranche/JYearn";
import { JBenQi } from "../generated/Tranche/JBenQi";
import { Tranche, TrancheUser, TrancheParams } from "../generated/schema"
import { newTranche, getTrancheId, getTokenSymbol, getUserId, getTokenName, getTrancheAApy } from './helper';
import { APYType } from './type';

export function handleJcompound(event: TrancheAddedToProtocol): void {
  let trancheNum = event.params.trancheNum;
  let trParams = new TrancheParams(event.transaction.hash.toHexString());
  let trancheContract = JCompound.bind(event.address);
  let trancheParams = trancheContract.trancheParameters(trancheNum);
  trParams.underlyingDecimals = BigInt.fromI32(trancheParams.value6);
  trParams.trancheACurrentRPB = trancheParams.value3;
  trParams.save();
  let trancheObj = handleTrancheAdd(event);
  trancheObj.metaData = trParams.id;
  trancheObj.trancheAPYBlock = BigInt.fromI32(2102400);
  // trancheObj.AApy = getTrancheAApy(trancheContract.getTrancheAExchangeRate(trancheNum), trParams.trancheACurrentRPB, BigInt.fromI32(2102400));
  trancheObj.save();
}
export function handleJAaveTime(event: TrancheAddedToProtocol): void {
  handleJAave(event, { block: BigInt.fromI32(31557600) });
}
export function handleJAavePolygon(event: TrancheAddedToProtocol): void {
  handleJAave(event, { block: BigInt.fromI32(15768000) });
}

export function handleJAave(event: TrancheAddedToProtocol, data: APYType): void {
  let trancheNum = event.params.trancheNum;
  let trParams = new TrancheParams(event.transaction.hash.toHexString());
  let trancheContract = JAave.bind(event.address);
  let trancheParams = trancheContract.trancheParameters(trancheNum);
  trParams.underlyingDecimals = BigInt.fromI32(trancheParams.value5);
  trParams.trancheACurrentRPB = trancheParams.value3;
  trParams.trancheARate = trancheContract.getTrancheAExchangeRate(trancheNum);
  trParams.save();
  let trancheObj = handleTrancheAdd(event);
  trancheObj.metaData = trParams.id;
  trancheObj.trancheAPYBlock = data.block;
  trancheObj.AApy = getTrancheAApy(trancheContract.getTrancheAExchangeRate(trancheNum), trParams.trancheACurrentRPB, data.block);
  trancheObj.save();
}

export function handleJYearn(event: TrancheAddedToProtocol): void {
  let trancheNum = event.params.trancheNum;
  let trParams = new TrancheParams(event.transaction.hash.toHexString());
  let trancheContract = JYearn.bind(event.address);
  let trancheParams = trancheContract.trancheParameters(trancheNum);
  trParams.underlyingDecimals = BigInt.fromI32(trancheParams.value5);
  trParams.trancheACurrentRPB = trancheParams.value3;
  trParams.trancheARate = trancheContract.getTrancheAExchangeRate(trancheNum);
  trParams.save();
  let trancheObj = handleTrancheAdd(event);
  trancheObj.metaData = trParams.id;
  trancheObj.trancheAPYBlock = BigInt.fromI32(31557600);
  trancheObj.AApy = getTrancheAApy(trancheContract.getTrancheAExchangeRate(trancheNum), trParams.trancheACurrentRPB, BigInt.fromI32(31557600));
  trancheObj.save();
}

export function handleJBenQi(event: TrancheAddedToProtocol): void {
  let trancheNum = event.params.trancheNum;
  let trParams = new TrancheParams(event.transaction.hash.toHexString());
  let trancheContract = JBenQi.bind(event.address);
  let trancheParams = trancheContract.trancheParameters(trancheNum);
  trParams.underlyingDecimals = BigInt.fromI32(trancheParams.value6);
  trParams.trancheACurrentRPB = trancheParams.value3;
  trParams.save();
  let trancheObj = handleTrancheAdd(event);
  trancheObj.metaData = trParams.id;
  trancheObj.trancheAPYBlock = BigInt.fromI32(31557600);
  trancheObj.AApy = getTrancheAApy(trancheContract.getTrancheAExchangeRate(trancheNum), trParams.trancheACurrentRPB, BigInt.fromI32(31557600));
  trancheObj.save();
}

export function handleTrancheAdd(event: TrancheAddedToProtocol): Tranche {
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
  trancheObj.contractAddress = event.address.toHex().toLowerCase();
  if (trancheObj.buyerCoinAddress != '0x0000000000000000000000000000000000000000' && trancheObj.buyerCoinAddress != '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    trancheObj.cryptoType = getTokenSymbol(trancheAddresses.value0);
  } else {
    trancheObj.cryptoType = '0x0000000000000000000000000000000000000000'
  }
  trancheObj.trancheId = trancheNum;
  trancheObj.dividendType = getTokenSymbol(trancheAddresses.value1);
  trancheObj.AName = getTokenName(Address.fromString(trancheObj.ATrancheAddress));
  trancheObj.BName = getTokenName(Address.fromString(trancheObj.BTrancheAddress));
  trancheObj.trancheAValue = trancheContract.getTrAValue(trancheNum);
  trancheObj.trancheBValue = trancheContract.getTrBValue(trancheNum);
  trancheObj.save();
  return trancheObj;
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
    let trancheParams = TrancheParams.load(trancheObj.metaData);
    if (trancheParams) {
      trancheParams.trancheARate = trancheContract.getTrancheAExchangeRate(trancheNum);
      trancheParams.save();
      trancheObj.AApy = getTrancheAApy(trancheParams.trancheARate, trancheParams.trancheACurrentRPB, trancheObj.trancheAPYBlock);
    }
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


