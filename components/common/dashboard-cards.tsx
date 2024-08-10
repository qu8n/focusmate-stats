/* eslint-disable @typescript-eslint/no-explicit-any */
// This file houses reusable dashboard cards

import { RiTimeLine, RiUser3Line, RiVideoOnLine } from "@remixicon/react"
import { Card } from "../ui/card"
import { Stat } from "../ui/stat"
import { BarChart, Legend } from "../charts/bar-chart"
import { DonutChart } from "../charts/donut-chart"
import { Text } from "@/components/ui/text"

export function TotalSessions({ data }: { data: any }) {
  const hasDelta = data.curr_period.sessions_delta
  return (
    <Card
      icon={<RiVideoOnLine size={16} className="opacity-40" />}
      title="Total sessions"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.sessions_total}
        changeVal={hasDelta ? hasDelta : undefined}
        changeText={
          hasDelta ? `vs. previous ${data.curr_period.period_type}` : undefined
        }
      />
    </Card>
  )
}

export function TotalHours({ data }: { data: any }) {
  const hasDelta = data.curr_period.hours_delta
  return (
    <Card
      icon={<RiTimeLine size={16} className="opacity-40" />}
      title="Total hours"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.hours_total}
        changeVal={hasDelta ? hasDelta : undefined}
        changeText={
          hasDelta ? `vs. previous ${data.curr_period.period_type}` : undefined
        }
      />
    </Card>
  )
}

export function TotalPartners({ data }: { data: any }) {
  return (
    <Card
      icon={<RiUser3Line size={16} className="opacity-40" />}
      title="Total partners"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.partners_total}
        changeText={`${data.curr_period.partners_repeat.toLocaleString()} repeat`}
      />
    </Card>
  )
}

export function SessionsByPeriod({
  periodType,
  chartData,
}: {
  periodType: string
  chartData: any
}) {
  return (
    <Card title={`Sessions by ${periodType}`} className="sm:col-span-6">
      <BarChart
        data={chartData}
        index="start_period_str"
        categories={["25m", "50m", "75m"]}
        type="stacked"
        colors={["custom-1", "custom-2", "custom-3"]}
        valueFormatter={(value) => value.toLocaleString()}
        allowDecimals={false}
        showYAxis={false}
        legendPosition="left"
      />
    </Card>
  )
}

export function SessionsByPunctuality({
  data,
  totalSessions,
}: {
  data: any
  totalSessions: number
}) {
  return (
    <Card title="Sessions by punctuality" className="sm:col-span-3">
      <Legend
        categories={["Early", "Late"]}
        colors={["custom-4", "custom-5"]}
      />

      <div className="grid grid-cols-2 items-center mt-3">
        <DonutChart
          data={data.charts.punctuality.data}
          variant="pie"
          category="punctuality"
          value="amount"
          colors={["custom-4", "custom-5"]}
          valueFormatter={(value) =>
            `${value} (${Math.round((value / totalSessions) * 100)}%)`
          }
          className="ml-4"
        />

        <div className="flex flex-col">
          <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
            <span>{data.charts.punctuality.data[0].punctuality}</span>
            <span>
              {data.charts.punctuality.data[0].amount.toLocaleString()} (
              {Math.round(
                (data.charts.punctuality.data[0].amount / totalSessions) * 100
              )}
              %)
            </span>
          </Text>
          <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
            <span>Average</span>
            <span>{data.charts.punctuality.avg}</span>
          </Text>
          <Text className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0">
            <span>Median</span>
            <span>{data.charts.punctuality.median}</span>
          </Text>
        </div>
      </div>
    </Card>
  )
}

export function SessionsByDuration({
  data,
  totalSessions,
}: {
  data: any
  totalSessions: number
}) {
  return (
    <Card title="Sessions by duration" className="sm:col-span-3">
      <Legend
        categories={["25m", "50m", "75m"]}
        colors={["custom-1", "custom-2", "custom-3"]}
      />

      <div className="grid grid-cols-2 items-center mt-3">
        <DonutChart
          data={data.charts.duration}
          variant="pie"
          category="duration"
          value="amount"
          colors={["custom-1", "custom-2", "custom-3"]}
          valueFormatter={(value) =>
            `${value} (${Math.round((value / totalSessions) * 100)}%)`
          }
          className="ml-4"
        />

        <div className="flex flex-col">
          {data.charts.duration.map(
            (item: { duration: string; amount: number }) => {
              return (
                <Text
                  key={item.duration}
                  className="flex justify-between border-b border-stone-200 last:border-none py-2 last:pb-0"
                >
                  <span>{item.duration}</span>
                  <span>
                    {item.amount.toLocaleString()} (
                    {Math.round((item.amount / totalSessions) * 100)}
                    %)
                  </span>
                </Text>
              )
            }
          )}
        </div>
      </div>
    </Card>
  )
}

export function SessionsByHour({ data }: { data: any }) {
  return (
    <Card title="Sessions by hour of the day" className="sm:col-span-6">
      <BarChart
        index="start_time_hour"
        categories={["25m", "50m", "75m"]}
        type="stacked"
        data={data.charts.hour}
        colors={["custom-1", "custom-2", "custom-3"]}
        allowDecimals={false}
        showYAxis={false}
        tickGap={28}
        legendPosition="left"
      />
    </Card>
  )
}
