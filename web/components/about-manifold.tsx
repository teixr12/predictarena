type AboutPredictaProps = {
  className?: string
}

export const AboutPredictaArena = ({ className = '' }: AboutPredictaProps) => {
  return (
    <div className={`${className}`}>
      <div className="mb-2">
        PREDICTA Arena is the safe simulator that trains you for Kalshi &
        Polymarket.
      </div>
      <div className="mb-2">
        Practice prediction markets with play money. Build your forecasting
        skills risk-free.
      </div>
      <div className="mb-2">
        Track your accuracy, earn your Foresight Portfolio, and prove you're
        ready for real markets.
      </div>
    </div>
  )
}
