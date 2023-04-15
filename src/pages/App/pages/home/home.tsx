import { Center } from '../../../../components/Center';
import React from 'react';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import AccountBalanceInfo from '../../components/account-balance-info';
import AccountInfo from '../../components/account-info';
import Header from '../../components/header';
import { HomeButtons } from '../../components/home-buttons';
import { useBackgroundSelector } from '../../hooks';

const Home = () => {
  const activeAccount = useBackgroundSelector(getActiveAccount);

  return (
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
      <Header mb={2} />
      {activeAccount && (
        <AccountInfo mb={2} address={activeAccount} showOptions={false} />
      )}
      <AccountBalanceInfo mb={2} address={activeAccount || ''} />
      <HomeButtons activeAccount={activeAccount || ''} />
    </Center>
  );
};

export default Home;
