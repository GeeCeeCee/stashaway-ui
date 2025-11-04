"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import axios from "axios";
import { DepositPlan, PortfolioPlans } from "./types";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const depositInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const [allocations, setAllocations] = React.useState<{
    isOkay: boolean | null;
    fundAllocation?: Record<string, number>;
    fundLedgers?: Array<{ [k: string]: number }>;
  }>({ isOkay: true });

  const [deposits, setDeposits] = React.useState<number[]>([]);
  const [depositPlans, setDepositPlans] = React.useState<DepositPlan[]>([
    {
      type: "one-time",
      isEnabled: false,
      allocations: [],
    },
    {
      type: "monthly",
      isEnabled: false,
      allocations: [],
    },
  ]);
  const [currentPlanType, setCurrentPlanType] =
    React.useState<PortfolioPlans>("one-time");

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollTo({
        left: sectionRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [deposits]);

  const addPortfolioPlan = (name: string) => {
    setDepositPlans((depositPlans) =>
      depositPlans.map((plan) => ({
        ...plan,
        allocations: [{ portfolioName: name, amount: 1 }, ...plan.allocations],
      }))
    );
  };

  const handlePortfolioInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current?.value.trim()) {
      addPortfolioPlan(inputRef.current.value.trim());
      inputRef.current.value = "";
    }
  };

  const handleFundAllocation = () => {
    const newPlans: any = [];
    setAllocations({ ...allocations, isOkay: null });

    depositPlans.forEach((each) =>
      newPlans.push({
        ...each,
        type: each.type.toUpperCase().replace("-", "_"),
      })
    );
    axios
      .post("/api/allocate", {
        depositPlans: newPlans,
        deposits,
      })
      .then((data) => {
        setAllocations({ ...data.data, isOkay: true });
      })
      .catch((error) => {
        console.error("Error during fund allocation:", error);
        setAllocations({ isOkay: false });
      });
  };

  const handleDepositInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && depositInputRef.current?.value) {
      setDeposits([...deposits, Number(depositInputRef.current.value)]);
      depositInputRef.current.value = "";
    }
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentPlanType: string,
    portfolioName: string
  ) => {
    const newDepositPlans = [...depositPlans];
    const planIndex = newDepositPlans.findIndex(
      (el) => el.type === currentPlanType
    );
    const allocationIndex = newDepositPlans[planIndex].allocations.findIndex(
      (el) => el.portfolioName === portfolioName
    );

    if (allocationIndex !== -1) {
      newDepositPlans[planIndex].allocations[allocationIndex].amount = Number(
        e.target.value
      );
      setDepositPlans(newDepositPlans);
    }
  };

  const handlePlanActivation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    const newDepositPlans = [...depositPlans];
    newDepositPlans[
      newDepositPlans.findIndex((el) => el.type === currentPlanType)
    ].isEnabled = isEnabled;

    setDepositPlans(newDepositPlans);
  };

  const renderDepositInput = () => (
    <label className="input w-full sm:w-3/4 mx-auto">
      <svg
        className="h-[1em] opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      <input
        disabled={
          depositPlans[0].allocations.length === 0 &&
          depositPlans[1].allocations.length === 0
        }
        ref={depositInputRef}
        type="number"
        className="grow"
        placeholder="Deposit amount"
        onKeyDown={handleDepositInput}
      />
      <div
        className="tooltip tooltip-bottom"
        data-tip="Press enter to add deposit"
      >
        <kbd className="kbd kbd-sm">↵</kbd>
      </div>
    </label>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-10 px-4 sm:px-8 lg:px-16 bg-white dark:bg-black">
        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* Left Section */}
          <div className="card rounded-box grid place-items-center w-full lg:w-1/2 p-4 sm:p-6">
            <section className="w-full text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content text-center mb-4">
                Portfolio Plans
              </h2>

              <label className="input w-full sm:w-3/4 mx-auto">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  className="grow"
                  placeholder="Add a portfolio plan"
                  onKeyDown={handlePortfolioInput}
                />
                <div
                  className="tooltip tooltip-bottom"
                  data-tip="Press enter to add plan"
                >
                  <kbd className="kbd kbd-sm">↵</kbd>
                </div>
              </label>
            </section>

            <section className="w-full text-center mt-6">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  className={classNames(
                    "btn btn-outline",
                    currentPlanType === "one-time" ? "btn-active" : "",
                    depositPlans[
                      depositPlans.findIndex((el) => el.type === "one-time")
                    ].isEnabled
                      ? "btn-success"
                      : ""
                  )}
                  onClick={() => setCurrentPlanType("one-time")}
                >
                  One Time
                </button>
                <button
                  className={classNames(
                    "btn btn-outline",
                    currentPlanType === "monthly" ? "btn-active" : "",
                    depositPlans[
                      depositPlans.findIndex((el) => el.type === "monthly")
                    ].isEnabled
                      ? "btn-success"
                      : ""
                  )}
                  onClick={() => setCurrentPlanType("monthly")}
                >
                  Monthly
                </button>
              </div>
            </section>

            <section className="w-full text-center mt-6">
              {depositPlans[0].allocations.length > 0 &&
                depositPlans[1].allocations.length > 0 && (
                  <>
                    <div className="mb-4">
                      <label className="mr-3">
                        <i className="text-xs">
                          Would you like to enable this plan?
                        </i>
                      </label>
                      <label className="toggle text-base-content">
                        <input
                          type="checkbox"
                          checked={
                            depositPlans[
                              depositPlans.findIndex(
                                (el) => el.type === currentPlanType
                              )
                            ].isEnabled
                          }
                          onChange={handlePlanActivation}
                        />
                      </label>
                    </div>
                    <div className="overflow-x-auto w-full sm:w-3/4 mx-auto">
                      <table
                        className={classNames(
                          "table table-xs table-zebra w-full",
                          depositPlans[
                            depositPlans.findIndex(
                              (el) => el.type === currentPlanType
                            )
                          ].isEnabled
                            ? ""
                            : "opacity-30 pointer-events-none select-none"
                        )}
                      >
                        <thead>
                          <tr>
                            <td>Portfolio</td>
                            <td>Amount</td>
                          </tr>
                        </thead>
                        <tbody>
                          {depositPlans[
                            depositPlans.findIndex(
                              (el) => el.type === currentPlanType
                            )
                          ].allocations.map((plan, index) => (
                            <tr key={plan.portfolioName + index}>
                              <td>
                                <div className="badge badge-primary py-3 mt-2 mb-2">
                                  {plan.portfolioName}
                                </div>
                              </td>
                              <td>
                                <label className="mr-2">$</label>
                                <input
                                  onChange={(e) =>
                                    handleAmountChange(
                                      e,
                                      currentPlanType,
                                      plan.portfolioName
                                    )
                                  }
                                  className="w-20 p-1.5 border rounded"
                                  min="1"
                                  type="number"
                                  value={Number(plan.amount) || 1}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
            </section>
          </div>

          <div className="hidden lg:flex divider lg:divider-horizontal" />

          <div className="card rounded-box grid place-items-center w-full lg:w-1/2 p-4 sm:p-6">
            <section className="w-full text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-4">
                Deposits
              </h2>
              {depositPlans[0].allocations.length === 0 &&
              depositPlans[1].allocations.length === 0 ? (
                <div
                  className="tooltip tooltip-bottom"
                  data-tip="Add a portfolio plan to enable deposits"
                >
                  {renderDepositInput()}
                </div>
              ) : (
                renderDepositInput()
              )}
            </section>

            <section
              className="w-full sm:w-3/4 mt-7 py-5 text-center overflow-y-scroll max-h-80 mx-auto"
              ref={sectionRef}
            >
              <ul className="timeline">
                {deposits.map((deposit, index) => (
                  <li key={index}>
                    {index !== 0 && <hr />}
                    <div className="timeline-middle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="timeline-end timeline-box">{deposit}</div>
                    <hr />
                  </li>
                ))}
              </ul>
            </section>

            {depositPlans[0].allocations.length !== 0 &&
              depositPlans[1].allocations.length !== 0 &&
              deposits.length > 0 && (
                <>
                  <section className="w-full text-center mt-10 flex flex-col justify-center items-center gap-3">
                    {!depositPlans[0]?.isEnabled &&
                      !depositPlans[1]?.isEnabled && (
                        <label className="max-w-xs text-sm text-gray-500">
                          Enable at least one plan to allocate the funds.
                        </label>
                      )}
                    <button
                      disabled={
                        !depositPlans[0]?.isEnabled &&
                        !depositPlans[1]?.isEnabled
                      }
                      className="btn btn-outline btn-primary w-full sm:w-auto mx-auto"
                      onClick={handleFundAllocation}
                    >
                      Allocate Funds
                    </button>
                  </section>

                  <section className="w-full text-center mt-10">
                    {allocations.isOkay == null && (
                      <span className="loading loading-ring loading-md"></span>
                    )}
                    {allocations.isOkay &&
                      allocations.fundAllocation != null && (
                        <div className="overflow-x-auto w-full sm:w-3/4 mx-auto">
                          <table className="table table-xs table-zebra w-full">
                            <thead>
                              <tr>
                                <td>Portfolio</td>
                                <td>Amount Allocated</td>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(allocations.fundAllocation).map(
                                (plan) => (
                                  <tr key={plan}>
                                    <td>
                                      <div className="badge badge-primary py-3 mt-2 mb-2">
                                        {plan}
                                      </div>
                                    </td>
                                    <td>
                                      <label className="mr-2">$</label>
                                      <div className="badge badge-primary py-3 mt-2 mb-2">
                                        {allocations.fundAllocation?.[plan] ??
                                          0}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    {allocations.isOkay === false && (
                      <div className="badge badge-error p-3 text-xs w-full sm:w-3/4 mx-auto mt-3">
                        There was an error. Please try again later.
                      </div>
                    )}
                  </section>
                </>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
