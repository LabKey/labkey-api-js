/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type TAggregate = 'AVG' | 'COUNT' | 'MAX' | 'MIN' | 'SUM';

/** Aggregates when pivoting a result set by a dimension. See {@link getData}. */
export enum Aggregate {
    /** Calculates an average. */
    AVG = 'AVG',
    /** Returns the total number of data points. */
    COUNT = 'COUNT',
    /** Returns the maximum value. */
    MAX = 'MAX',
    /** Returns the minimum value. */
    MIN = 'MIN',
    /** Calculates a sum/total. */
    SUM = 'SUM',
}

export type TInterval = 'DAY' | 'MONTH' | 'WEEK' | 'YEAR';

/** Intervals are for aligning series in time plots. See {@link getData}. */
export enum Interval {
    /** Align by the number of days since the zero date. */
    DAY = 'DAY',
    /** Align by the number of months since the zero date. */
    MONTH = 'MONTH',
    /** Align by the number of weeks since the zero date. */
    WEEK = 'WEEK',
    /** Align by the number of years since the zero date. */
    YEAR = 'YEAR',
}

export type TType = 'ReportService.GenericChartReport' | 'ReportService.TimeChartReport';

/**
 * @namespace Type predefined set of visualization types, for use in the config.type property in the
 * {@link save} method.
 */
export const Type: {
    [key: string]: string;
} = {
    /**
     * Plot types that are not study specific (i.e. Bar, Box, Pie, and Scatter).
     */
    GenericChart: 'ReportService.GenericChartReport',
    /**
     * Plots data over time, aligning different series based on configurable start dates.
     */
    TimeChart: 'ReportService.TimeChartReport',
};
