"use client"

import { Line, Bar } from "react-chartjs-2"
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend
)

const chartOptions = {
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
	},
	scales: {
		y: {
			beginAtZero: true,
		},
	},
}

interface ChartProps {
	data: number[]
	labels: string[]
}

export function LineChart({ data, labels }: ChartProps) {
	const chartData = {
		labels,
		datasets: [
			{
				label: "Data",
				data,
				borderColor: "rgb(75, 192, 192)",
				tension: 0.1,
			},
		],
	}

	return <Line options={chartOptions} data={chartData} />
}

export function BarChart({ data, labels }: ChartProps) {
	const chartData = {
		labels,
		datasets: [
			{
				label: "Data",
				data,
				backgroundColor: "rgba(75, 192, 192, 0.5)",
			},
		],
	}

	return <Bar options={chartOptions} data={chartData} />
}