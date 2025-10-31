
import { ethers } from 'ethers';

async function main() {
  // Адрес развернутого контракта
  const ARBITRAGE_CONTRACT = '0x794a61358D6845594F94dc1DB02A252b5b4814aD';
  
  // Адрес кошелька, который нужно авторизовать
  const EXECUTOR_ADDRESS = '0x3dCBc8f5de99AAD6CA1b97674C582C7bA099ef58';
  
  // Приватный ключ владельца контракта
  const OWNER_PRIVATE_KEY = process.env.PRIVATE_KEY;
  
  if (!OWNER_PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY не установлен в переменных окружения');
  }
  
  // Подключение к Polygon (несколько RPC для надежности)
  const providers = [
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.network',
    'https://polygon-bor-rpc.publicnode.com'
  ];
  
  let provider: ethers.JsonRpcProvider | null = null;
  
  for (const rpcUrl of providers) {
    try {
      const testProvider = new ethers.JsonRpcProvider(rpcUrl);
      await testProvider.getBlockNumber(); // Проверяем соединение
      provider = testProvider;
      console.log('✅ Подключено к:', rpcUrl);
      break;
    } catch (err) {
      console.log('⚠️  RPC недоступен:', rpcUrl);
    }
  }
  
  if (!provider) {
    throw new Error('Все RPC провайдеры недоступны');
  }
  
  const signer = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  // Проверка баланса владельца
  const balance = await provider.getBalance(signer.address);
  console.log('💰 Баланс owner:', ethers.formatEther(balance), 'MATIC');
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Недостаточно MATIC для оплаты газа (минимум 0.01 MATIC)');
  }
  
  // ABI для функции addExecutor
  const contractABI = [
    'function addExecutor(address executor) external',
    'function approvedExecutors(address) external view returns (bool)',
    'function owner() external view returns (address)'
  ];
  
  const contract = new ethers.Contract(ARBITRAGE_CONTRACT, contractABI, signer);
  
  console.log('\n🔐 Авторизация исполнителя...');
  console.log('   Контракт:', ARBITRAGE_CONTRACT);
  console.log('   Исполнитель:', EXECUTOR_ADDRESS);
  
  // Проверяем owner контракта
  let contractOwner: string;
  try {
    contractOwner = await contract.owner();
    console.log('   Owner контракта:', contractOwner);
    console.log('   Ваш адрес:', signer.address);
  } catch (err) {
    throw new Error('Не удалось получить owner контракта. Проверьте адрес контракта.');
  }
  
  // Проверяем, что вы owner
  if (contractOwner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Вы не owner контракта! Owner: ${contractOwner}, Вы: ${signer.address}`);
  }
  
  // Проверяем текущий статус
  const isApproved = await contract.approvedExecutors(EXECUTOR_ADDRESS);
  
  if (isApproved) {
    console.log('\n✅ Исполнитель уже авторизован!');
    return;
  }
  
  console.log('\n📝 Отправка транзакции авторизации...');
  
  // Авторизуем исполнителя
  const tx = await contract.addExecutor(EXECUTOR_ADDRESS, {
    gasLimit: 100000 // Устанавливаем лимит газа
  });
  
  console.log('📤 Транзакция отправлена:', tx.hash);
  console.log('⏳ Ожидание подтверждения...');
  
  const receipt = await tx.wait();
  console.log('✅ Транзакция подтверждена в блоке:', receipt?.blockNumber);
  
  // Проверяем результат
  const isNowApproved = await contract.approvedExecutors(EXECUTOR_ADDRESS);
  
  if (isNowApproved) {
    console.log('\n🎉 Исполнитель успешно авторизован!');
    console.log('   Можно запускать бота в режиме реальной торговли');
  } else {
    console.log('\n⚠️  Авторизация прошла, но статус не изменился');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  });
