export const address = {
  goerli: {
    // hyperlane
    mailbox: '0xCC737a94FecaeC165AbCf12dED095BB13F037685',
    defaultIsmInterchainGasPaymaster:
      '0xF90cB82a76492614D07B82a7658917f3aC811Ac1',
    testRecipient: '0xBC3cFeca7Df5A45d61BC60E7898E63670e1654aE',
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',

    // zkBOB
    BOB: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    // hyperBOB
    accountImp: '0xeb3d8191d134B40fF093eB9FA56adEdE3389d6a6',
    accountFactory: '0xE8D3AF8dE4B0a7Cdaf73B041dE0166B505DABcb3',
    // old: 0x95751b91b1d34537cd8a208d9b39093538d9d510
    hypERCCollateral: '0xCc997E02991b8Ac033296a03117e55Ac4E6C32C9',

    // Uniswap
    router: '0x4648a43B2C14Da09FdF82B161150d3F634f40491',
  },
  sepolia: {
    //hyperlane
    mailbox: '0xCC737a94FecaeC165AbCf12dED095BB13F037685',
    defaultIsmInterchainGasPaymaster:
      '0xF987d7edcb5890cB321437d8145E3D51131298b6',
    weth: '0xdd13E55209Fd76AfE204dBda4007C227904f0a81',

    // zkBOB
    BOB: '0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f',
    DIRECT_DEPOSIT: '0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f',

    // hyperBOB
    accountImp: '0x3e809ab2E61A6734Fea18E3F781a7c4b87c8291E',
    accountFactory: '0x95ba6f70a1F8ac82ED20714635052656c9F44FfA',
    hypERC: '0xfB1C4Ad3af37084c0419bC6E76d7e6b0cf389339',
  },
  common: {
    entryPoint: '0x0576a174D229E3cFA37253523E645A78A0C91B57',
  },
};
