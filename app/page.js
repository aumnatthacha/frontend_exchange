/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers, parseUnits } from "ethers";
import { formatEther } from "@ethersproject/units";
import abi from "./abi.json";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from '@mui/material/TextField';

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } = hooks;
const contractChain = 11155111;
const contractAddress = "0x79a56a164be8Da57691a460a5514D3D58bF67b6b";




export default function Page() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActive = useIsActive();

  const provider = useProvider();
  const [error, setError] = useState(undefined);

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
  };

  const [balance, setBalance] = useState("");
  useEffect(() => {
    const fetchBalance = async () => {
      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer)
      const myBalance = await smartContract.balanceOf(accounts[0])
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance))
    };
    if (isActive) {
      fetchBalance();
    }
  }, [isActive]);

  const [aumValue, setAumValue] = useState(0);

  const handleSetAumValue = event => {
    setAumValue(event.target.value)
  }

  const handleBuyAum = async () => {
    try {
      if (aumValue <= 0) {
        return;
      }

      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const buyValue = parseUnits(aumValue.toString(), "ether");
      const tx = await smartContract.buy({
        value: buyValue.toString(),
      });
      console.log("Transaction hash:", tx.hash);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SE
            </Typography>

            {isActive ? (
              <Stack direction="row" spacing={1}>
                <Chip label={accounts ? accounts[0] : ""} />

                <Button color="inherit" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </Stack>
            ) : (
              <Button color="inherit" onClick={handleConnect}>
                connect
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <div className="container_center">
        <div className="card">
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            {isActive && (<h3>My Wallet Balance</h3>)}
            {isActive && (<TextField label="Address" value={accounts ? accounts[0] : ""} />)}<br />
            {isActive && (<TextField label="Aum Balance" value={balance} />)}<br />
            {isActive && (<h3 >Buy Aum Token</h3>)}
            {isActive && (<TextField label="Enter amount of Ether you want to buy aum Token" defaultValue=""
              type="number" onChange={handleSetAumValue} />)}<br />
            <Button color="success" variant="contained" onClick={handleBuyAum}>
              Buy AUM Token
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
}
