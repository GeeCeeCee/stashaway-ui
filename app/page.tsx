"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import classNames from "classnames";
import axios from "axios";
import { DepositPlan, PortfolioPlans } from "./types";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const depositInputRef = useRef<HTMLInputElement>(null);
  const [allocations, setAllocations] = React.useState<{
    isOkay: boolean | null;
    fundAllocation?: Record<string, number>;
    fundLedgers?: Array<{ [k: string]: number }>;
  }>({ isOkay: true });

  const [deposits, setDeposits] = React.useState<number[]>([]);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollTo({
        left: sectionRef.current.scrollWidth,
        behavior: "smooth", // set to "auto" if you want no animation
      });
    }
  }, [deposits]);

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

  const addPortfolioPlan = (name: string) => {
    setDepositPlans((depositPlans) => {
      return depositPlans.map((plan) => ({
        ...plan,
        allocations: [{ portfolioName: name, amount: 1 }, ...plan.allocations],
      }));
    });
    // setPortfolioPlans([...portfolioPlans, name]);
  };

  const handlePortfolioInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" && inputRef.current?.value.trim()) ??
      "".length > 0
    ) {
      addPortfolioPlan(inputRef.current!.value.trim());
      inputRef.current!.value = "";
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
      setDeposits([...deposits, Number(depositInputRef.current!.value)]);
      depositInputRef.current!.value = "";
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
    <label className="input">
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
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full">
          <div className="card rounded-box grid h-32card rounded-box grid h-32 grow place-items-center grow place-items-center">
            <section className="w-full text-center">
              <h2 className="text-2xl font-bold text-base-content text-center mb-4">
                Portfolio Plans
              </h2>

              <label className="input">
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

            <section className="w-full text-center">
              <div className="p-6 flex items-center justify-center gap-7 w-full">
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
                  onClick={() => {
                    setCurrentPlanType("one-time");
                  }}
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
                  onClick={() => {
                    setCurrentPlanType("monthly");
                  }}
                >
                  Monthly
                </button>
              </div>
            </section>

            <section className="w-full text-center">
              {depositPlans[0].allocations.length > 0 &&
                depositPlans[1].allocations.length > 0 && (
                  <>
                    <div className="mb-5">
                      <label className="mr-5">
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

                        <svg
                          aria-label="disabled"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>

                        <svg
                          aria-label="enabled"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="4"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path d="M20 6 9 17l-5-5"></path>
                          </g>
                        </svg>
                      </label>
                    </div>
                    <div className="overflow-x-auto  w-65 h-92 center mx-auto">
                      <table
                        className={classNames(
                          "table table-xs table-pin-rows table-zebra",
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
                            {/* <th></th> */}
                            <td>Portfolio</td>
                            <td>Amount</td>
                            {/* <th></th> */}
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
                                <div className="badge badge-soft badge-primary py-4 mt-2 mb-2">
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
                                  className="w-20 p-1.5"
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
          <div className="divider lg:divider-horizontal" />
          <div className="card rounded-box grid h-32card rounded-box grid h-32 grow place-items-center grow place-items-center">
            <section className="w-full text-center">
              <h2 className="text-2xl font-bold text-base-content text-center mb-4">
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
              className="w-75 mt-7 py-7 text-center overflow-y-scroll center scrollbar-always-show scrollbar-gutter-stable"
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
                  <section className="w-full text-center mt-10 flex flex-col justify-center items-center">
                    {!depositPlans[0]?.isEnabled &&
                      !depositPlans[1]?.isEnabled && (
                        <label className="mr-5 max-w-70">
                          <i className="text-xs">
                            Enable at least one plan to allocate the funds.
                          </i>
                        </label>
                      )}
                    <button
                      disabled={
                        !depositPlans[0]?.isEnabled &&
                        !depositPlans[1]?.isEnabled
                      }
                      className="btn btn-outline btn-primary max-w-65 mt-3"
                      onClick={handleFundAllocation}
                    >
                      Allocate Funds
                    </button>
                  </section>
                  <section className="w-full text-center mt-20 ">
                    {allocations.isOkay == null && (
                      <span className="loading loading-ring loading-md"></span>
                    )}
                    {allocations.isOkay &&
                      allocations.fundAllocation != null && (
                        <table
                          className={classNames(
                            "table table-xs table-pin-rows  center w-65 mx-auto"
                          )}
                        >
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
                                    <div className="badge badge-soft badge-primary py-4 mt-2 mb-2">
                                      {plan}
                                    </div>
                                  </td>
                                  <td>
                                    <label className="mr-2">$</label>
                                    <div className="badge badge-soft badge-primary py-4 mt-2 mb-2">
                                      {allocations.fundAllocation?.[plan] ?? 0}
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}

                    {allocations.isOkay === false && (
                      <div className="badge badge-soft badge-error p-3 text-xs w-75">
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
