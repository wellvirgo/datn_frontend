import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'apexcharts'
import { ChartType } from 'ng-apexcharts'

export interface ChartOptions {
    series: ApexAxisChartSeries;
    chart: ApexChart & { type: ChartType };
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
}