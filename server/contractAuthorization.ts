
import { ethers } from 'ethers';
import { storage } from './storage';

interface AuthorizationResult {
  success: boolean;
  message: string;
  txHash?: string;
  error?: string;
}

async function getWalletInfo() {
  const config = await storage.getBotConfig('demo-user-1');
  if (!config?.privateKey) {
    throw new Error('Private key не настроен в конфигурации');
  }
  
  const rpcUrl = config.networkMode === 'mainnet' 
    ? config.polygonRpcUrl 
    : config.polygonTestnetRpcUrl;
    
  if (!rpcUrl) {
    throw new Error('RPC URL не настроен');
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  
  return {
    address: wallet.address,
    provider,
    wallet
  };
}

export async function authorizeExecutor(executorAddress: string): Promise<AuthorizationResult> {
  try {
    const config = await storage.getBotConfig('demo-user-1');

    if (!config.privateKey) {
      return {
        success: false,
        message: 'Private key не настроен',
        error: 'PRIVATE_KEY_MISSING'
      };
    }

    if (!config.flashLoanContract) {
      return {
        success: false,
        message: 'Адрес контракта ArbitrageExecutor не настроен',
        error: 'CONTRACT_ADDRESS_MISSING'
      };
    }

    // Подключение к сети
    const rpcUrl = config.networkMode === 'mainnet' 
      ? config.polygonRpcUrl 
      : config.polygonTestnetRpcUrl;

    if (!rpcUrl) {
      return {
        success: false,
        message: 'RPC URL не настроен',
        error: 'RPC_URL_MISSING'
      };
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);

    // Проверка баланса
    const balance = await provider.getBalance(signer.address);
    if (balance < ethers.parseEther('0.01')) {
      return {
        success: false,
        message: `Недостаточно ${config.networkMode === 'mainnet' ? 'MATIC' : 'tMATIC'} для оплаты газа (минимум 0.01)`,
        error: 'INSUFFICIENT_BALANCE'
      };
    }

    // ABI контракта
    const contractABI = [
      'function addExecutor(address executor) external',
      'function approvedExecutors(address) external view returns (bool)',
      'function owner() external view returns (address)'
    ];

    const contract = new ethers.Contract(config.flashLoanContract, contractABI, signer);

    // Проверяем owner
    const contractOwner = await contract.owner();
    if (contractOwner.toLowerCase() !== signer.address.toLowerCase()) {
      return {
        success: false,
        message: `Вы не owner контракта. Owner: ${contractOwner}`,
        error: 'NOT_OWNER'
      };
    }

    // Проверяем, авторизован ли уже
    const isApproved = await contract.approvedExecutors(executorAddress);
    if (isApproved) {
      return {
        success: true,
        message: 'Executor уже авторизован'
      };
    }

    // Авторизуем executor
    const tx = await contract.addExecutor(executorAddress, {
      gasLimit: 100000
    });

    const receipt = await tx.wait();

    // Проверяем результат
    const isNowApproved = await contract.approvedExecutors(executorAddress);

    if (isNowApproved) {
      return {
        success: true,
        message: 'Executor успешно авторизован',
        txHash: tx.hash
      };
    } else {
      return {
        success: false,
        message: 'Транзакция выполнена, но статус не изменился',
        error: 'AUTHORIZATION_FAILED',
        txHash: tx.hash
      };
    }
  } catch (error: any) {
    console.error('Authorization error:', error);
    return {
      success: false,
      message: error.message || 'Ошибка авторизации',
      error: 'UNKNOWN_ERROR'
    };
  }
}

export async function checkExecutorStatus(executorAddress: string): Promise<{
  isAuthorized: boolean;
  contractOwner?: string;
  error?: string;
}> {
  try {
    const config = await storage.getBotConfig('demo-user-1');

    if (!config?.flashLoanContract) {
      return { isAuthorized: false, error: 'CONTRACT_ADDRESS_MISSING' };
    }

    const rpcUrl = config.networkMode === 'mainnet' 
      ? config.polygonRpcUrl 
      : config.polygonTestnetRpcUrl;

    if (!rpcUrl) {
      return { isAuthorized: false, error: 'RPC_URL_MISSING' };
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Проверяем, что контракт существует
    const code = await provider.getCode(config.flashLoanContract);
    if (code === '0x') {
      return { 
        isAuthorized: false, 
        error: `CONTRACT_NOT_DEPLOYED: Контракт ${config.flashLoanContract} не развернут на ${config.networkMode === 'mainnet' ? 'Polygon Mainnet' : 'Polygon Amoy Testnet'}. Проверьте адрес контракта и выбранную сеть.`
      };
    }

    const contractABI = [
      'function approvedExecutors(address) external view returns (bool)',
      'function owner() external view returns (address)'
    ];

    const contract = new ethers.Contract(config.flashLoanContract, contractABI, provider);

    // Пробуем вызвать функции с обработкой ошибок
    try {
      const [isAuthorized, contractOwner] = await Promise.all([
        contract.approvedExecutors(executorAddress),
        contract.owner()
      ]);

      return {
        isAuthorized,
        contractOwner
      };
    } catch (callError: any) {
      // Если вызов функции не удался - возможно неправильный ABI
      return {
        isAuthorized: false,
        error: `CONTRACT_ABI_MISMATCH: Контракт найден, но не отвечает на вызовы. Возможно, это не контракт ArbitrageExecutor или используется устаревшая версия.`
      };
    }
  } catch (error: any) {
    console.error('Check status error:', error);
    return {
      isAuthorized: false,
      error: `NETWORK_ERROR: ${error.message}`
    };
  }
}
