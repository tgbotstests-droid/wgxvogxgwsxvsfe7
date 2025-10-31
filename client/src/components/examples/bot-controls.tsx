import { BotControls } from '../bot-controls'

export default function BotControlsExample() {
  return (
    <div className="p-6 max-w-4xl">
      <BotControls
        isRunning={false}
        isPaused={false}
        isSimulation={true}
        onStart={() => console.log('Бот запущен')}
        onStop={() => console.log('Бот остановлен')}
        onEmergencyStop={() => console.log('Экстренная остановка')}
        onToggleSimulation={(value) => console.log('Режим симуляции:', value)}
      />
    </div>
  )
}
