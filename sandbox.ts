import { Wallet } from "xrpl";
import { PaymentTx } from "xrplt"

const wallet = Wallet.generate();
console.log(wallet.classicAddress);
console.log(wallet.seed);
console.log(wallet.privateKey);


let tx = new PaymentTx({});
console.log(tx.toJSON());

tx = tx.with({
    Account: wallet.classicAddress,
    Amount: '100',
    Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
});
console.log(tx);

tx.validate()