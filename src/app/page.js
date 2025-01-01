"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

// FCL Configuration
fcl.config({
  "flow.network": "local",
  "accessNode.api": "http://localhost:8888",
  "discovery.wallet": "http://localhost:8701/fcl/authn", // Local Dev Wallet
});

export default function Home() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ loggedIn: false });

  const queryCount = async () => {
    try {
      const res = await fcl.query({
        cadence: `
          import Counter from 0xf8d6e0586b0a20c7
          import NumberFormatter from 0xf8d6e0586b0a20c7
          
          access(all)
          fun main(): String {
              // Retrieve the count from the Counter contract
              let count: Int = Counter.getCount()
          
              // Format the count using NumberFormatter
              let formattedCount = NumberFormatter.formatWithCommas(number: count)
          
              // Return the formatted count
              return formattedCount
          }
        `,
      });
      setCount(res);
    } catch (error) {
      console.error("Error querying count:", error);
    }
  };

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
    queryCount();
  }, []);

  const logIn = () => {
    fcl.authenticate();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };

  const incrementCount = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import Counter from 0xf8d6e0586b0a20c7

          transaction {

            prepare(acct: &Account) {
                // Authorizes the transaction
            }
        
            execute {
                // Increment the counter
                Counter.increment()
        
                // Retrieve the new count and log it
                let newCount = Counter.getCount()
                log("New count after incrementing: ".concat(newCount.toString()))
            }
        }
        `,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser.authorization],
        limit: 50,
      });

      console.log("Transaction Id", transactionId);

      await fcl.tx(transactionId).onceSealed();
      console.log("Transaction Sealed");

      queryCount();
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  };

  return (
    <div>
      <h1>Flow Counter</h1>
      <div>Count: {count}</div>
      {user.loggedIn ? (
        <div>
          <p>Address: {user.addr}</p>
          <button onClick={logOut}>Log Out</button>
          <div>
            <button onClick={incrementCount}>Increment Count</button>
          </div>
        </div>
      ) : (
        <button onClick={logIn}>Log In</button>
      )}
    </div>
  );
}
