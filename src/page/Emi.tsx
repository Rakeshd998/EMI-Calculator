import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import "./Emi.css";

Chart.register(ArcElement, Tooltip, Legend);

const Emi: React.FC = () => {
  // State variables to store user inputs
  const [calculationMode, setCalculationMode] = useState<string>("emi");
  const [loanAmt, setLoanAmt] = useState<number | "">("");
  const [tenure, setTenure] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number>(10);
  const [emi, setEmi] = useState<number | null>(null); // Store calculated EMI
  const [isYears, setIsYears] = useState<boolean>(false);
  const [isSliderMode, setIsSliderMode] = useState<boolean>(true);
  const [breakdown, setBreakdown] = useState<
    { month: number; principal: number; interest: number; balance: number }[]
  >([]); // EMI breakdown
  const [totalPrincipal, setTotalPrincipal] = useState<number>(0); // Total principal for pie chart
  const [totalInterest, setTotalInterest] = useState<number>(0);

  // Function to calculate EMI
  const calculateEmiOrTenure = () => {
    if (calculationMode === "emi") {
      // If calculating EMI
      if (loanAmt && tenure && interestRate) {
        const principal = loanAmt;
        const monthlyInterestRate = interestRate / (12 * 100); // Convert annual interest rate to monthly and decimal
        const numberOfMonths = isYears ? tenure * 12 : tenure; // Convert years to months if needed

        // EMI formula
        const emiValue =
          (principal *
            monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
          (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

        setEmi(emiValue);

        // Breakdown of EMI payments
        let remainingPrincipal = principal;
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;
        const emiBreakdown = [];
        for (let month = 1; month <= numberOfMonths; month++) {
          const interestPayment = remainingPrincipal * monthlyInterestRate;
          const principalRepayment = emiValue - interestPayment;
          remainingPrincipal -= principalRepayment;

          emiBreakdown.push({
            month,
            principal: principalRepayment,
            interest: interestPayment,
            balance: Math.max(remainingPrincipal, 0), // To avoid negative balance due to precision issues
          });

          totalPrincipalPaid += principalRepayment;
          totalInterestPaid += interestPayment;
        }

        setBreakdown(emiBreakdown);
        setTotalPrincipal(totalPrincipalPaid);
        setTotalInterest(totalInterestPaid);
      }
    } else if (calculationMode === "tenure") {
      // If calculating Tenure based on EMI
      if (loanAmt && emi && interestRate) {
        const principal = loanAmt;
        const monthlyInterestRate = interestRate / (12 * 100); // Convert annual interest rate to monthly decimal

        // Calculate tenure (in months) based on EMI
        const calculatedTenure =
          Math.log(emi / (emi - principal * monthlyInterestRate)) /
          Math.log(1 + monthlyInterestRate);

        const numberOfMonths = Math.ceil(calculatedTenure); // Round up to the nearest month
        setTenure(numberOfMonths);

        // Breakdown of EMI payments for tenure calculation
        let remainingPrincipal = principal;
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;
        const emiBreakdown = [];
        for (let month = 1; month <= numberOfMonths; month++) {
          const interestPayment = remainingPrincipal * monthlyInterestRate;
          const principalRepayment = emi - interestPayment;
          remainingPrincipal -= principalRepayment;

          emiBreakdown.push({
            month,
            principal: principalRepayment,
            interest: interestPayment,
            balance: Math.max(remainingPrincipal, 0),
          });

          totalPrincipalPaid += principalRepayment;
          totalInterestPaid += interestPayment;

          if (remainingPrincipal <= 0) break; // Stop if principal is fully paid
        }

        setBreakdown(emiBreakdown);
        setTotalPrincipal(totalPrincipalPaid);
        setTotalInterest(totalInterestPaid);
      }
    }
  };

  const pieData = {
    labels: ["Total Principal", "Total Interest"],
    datasets: [
      {
        label: "EMI Breakdown",
        data: [totalPrincipal, totalInterest],
        backgroundColor: ["#00BFFF", "#FF6347"], // Principal in blue, Interest in red
        hoverBackgroundColor: ["#1E90FF", "#FF4500"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h1>EMI CALCULATOR</h1>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            {/* Left Column Content */}
            <h3>Loan Details</h3>
            <div className="d-flex justify-content-center">
              <div className="radio-container">
                <input
                  type="radio"
                  id="calculateEMI"
                  name="calcMode"
                  value="emi"
                  checked={calculationMode === "emi"}
                  onChange={(e) => setCalculationMode(e.target.value)}
                />
                <label htmlFor="calculateEMI">Calculate EMI</label>
              </div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <div className="radio-container">
                <input
                  type="radio"
                  id="calculateTenure"
                  name="calcMode"
                  value="tenure"
                  checked={calculationMode === "tenure"}
                  onChange={(e) => setCalculationMode(e.target.value)}
                />
                <label htmlFor="calculateTenure">Calculate Tenure</label>
              </div>
            </div>
            <div>
              <label htmlFor="loanAmt">Loan Amount</label>
              <input
                type="number"
                className="increasewidth"
                id="loanAmt"
                placeholder="100000"
                value={loanAmt}
                onChange={(e) => setLoanAmt(Number(e.target.value))}
              />
            </div>

            {calculationMode === "emi" ? (
              <div>
                <label>Loan Tenure</label>
                <div>
                  <input
                    type="number"
                    id="tenure"
                    placeholder={isYears ? "2" : "24"}
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                  />
                  <select
                    value={isYears ? "years" : "months"}
                    onChange={(e) => setIsYears(e.target.value === "years")}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label>EMI Amount</label>
                <input
                  type="number"
                  value={emi || ""}
                  onChange={(e) => setEmi(Number(e.target.value))}
                  placeholder="Enter EMI Amount"
                />
              </div>
            )}
            <div className="slider-container">
              <label htmlFor="interestRate">Interest Rate (%)</label>
              {isSliderMode ? (
                <>
                  <input
                    type="range"
                    id="interestRate"
                    min="1"
                    max="100" // Updated to 100
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ width: "100%" }} // Full-width slider
                  />

                  {/* Display selected interest rate */}
                  <div className="tickmarks">
                    {Array.from({ length: 101 }, (_, index) => (
                      <span key={index} style={{ left: `${index}%` }}>
                        {index % 10 === 0 ? index : ""}{" "}
                        {/* Show tick marks every 10 */}
                      </span>
                    ))}
                  </div>
                  <span id="rangeInput">{interestRate}%</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    id="interestRateInput"
                    placeholder="Interest Rate (%)"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ width: "80%", maxWidth: "600px" }} // Adjust width as needed
                  />
                </>
              )}
            </div>
            <button onClick={calculateEmiOrTenure}>Calculate EMI</button>
            <div style={{ marginTop: "35px" }}>
              {calculationMode === "emi" && emi && (
                <h3>Calculated EMI: ₹{emi.toFixed(2)}</h3>
              )}
              {calculationMode === "tenure" && tenure && (
                <h3>Calculated Tenure: {Math.ceil(tenure)} months</h3>
              )}
            </div>
          </div>
          <div className="col-md-6">
            {/* Right Column Content */}
            {breakdown.length === 0 ? (
              <></>
            ) : (
              <>
                <h3>EMI Breakdown</h3>
                <section>
                  <div className="tbl-header">
                    <table cellPadding="0" cellSpacing="0" border={0}>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Remaining Balance</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="tbl-content">
                    <table cellPadding="0" cellSpacing="0" border={0}>
                      <tbody>
                        {breakdown.map((row) => (
                          <tr key={row.month}>
                            <td>{row.month}</td>
                            <td>₹{row.principal.toFixed(2)}</td>
                            <td>₹{row.interest.toFixed(2)}</td>
                            <td>₹{row.balance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <div
                  style={{
                    width: "300px",
                    height: "300px",
                    margin: "0 auto",
                    marginTop: "20px",
                  }}
                >
                  <Doughnut data={pieData} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emi;
