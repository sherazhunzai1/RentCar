// Progress indicator for the checkout flow: Review → Payment → Confirmation.
export default function Stepper({ active }) {
  const steps = ['Review', 'Payment', 'Confirmation']
  return (
    <ol className="stepper">
      {steps.map((label, i) => (
        <li key={label} className={i === active ? 'active' : i < active ? 'done' : ''}>
          <span className="step-dot">{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}
