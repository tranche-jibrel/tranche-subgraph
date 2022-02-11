
# Some query examples 
```
{
  users(where: { id: "0x8c082809def6a3c1742d84553b9c6ff1dbc161c8"}) {
    id
    address
    balance
    transactionCount
  }
}
{
  users(orderBy: transactionCount, orderDirection: desc) {
    id
    address
    balance
    transactionCount
  }
}


```
