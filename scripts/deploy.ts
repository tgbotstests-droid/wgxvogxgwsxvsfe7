
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY не установлен в переменных окружения');
  }
  
  // Определяем сеть из аргументов
  const network = process.argv[2] || 'testnet';
  
  let provider: ethers.JsonRpcProvider;
  let poolAddressesProvider: string;
  let networkName: string;
  
  if (network === 'mainnet') {
    provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    poolAddressesProvider = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
    networkName = 'Polygon Mainnet';
  } else {
    // Polygon Amoy Testnet
    provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    poolAddressesProvider = '0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6';
    networkName = 'Polygon Amoy Testnet';
  }
  
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('🚀 Деплой ArbitrageExecutor...');
  console.log('   Кошелек:', signer.address);
  console.log('   Сеть:', networkName);
  
  // Проверяем баланс
  const balance = await provider.getBalance(signer.address);
  console.log('   Баланс:', ethers.formatEther(balance), 'MATIC');
  
  if (balance < ethers.parseEther('0.05')) {
    throw new Error('Недостаточно MATIC для деплоя (минимум 0.05)');
  }
  
  // Читаем скомпилированный контракт
  const contractPath = path.join(__dirname, '..', 'contracts', 'ArbitrageExecutor.sol');
  
  console.log('\n⚠️  ИНСТРУКЦИЯ ПО ДЕПЛОЮ:');
  console.log('1. Скопируйте код контракта из contracts/ArbitrageExecutor.sol');
  console.log('2. Откройте https://remix.ethereum.org');
  console.log('3. Создайте файл ArbitrageExecutor.sol и вставьте код');
  console.log('4. Во вкладке "Solidity Compiler":');
  console.log('   - Выберите версию 0.8.19');
  console.log('   - Нажмите "Compile"');
  console.log('5. Во вкладке "Deploy & Run Transactions":');
  console.log('   - Environment: Injected Provider (MetaMask)');
  console.log('   - Переключите MetaMask на', networkName);
  console.log('   - В поле Constructor введите:', poolAddressesProvider);
  console.log('   - Нажмите "Deploy"');
  console.log('6. Скопируйте адрес развернутого контракта');
  console.log('7. Добавьте адрес в Settings → Bot Config → Flash Loan Contract Address');
  
  console.log('\n📋 Pool Addresses Provider для', networkName + ':', poolAddressesProvider);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  });
