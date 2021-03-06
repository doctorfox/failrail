// Namespace for FailRail functionality
var FailRail = {};

FailRail.Charter = {

	dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0AkdFf0ojY-LPdG52LWlpYU5kOG5USVpVbHAxMW5YSXc&headers=1&gid=0",

	dashboardId : "dashboard",

	init : function() {
		console.log("FailRail.Charter.init has been called");

		// FailRail.Charter.tutorial();

	},

	queryDashboard1 : function() {
		var columns = [ 'Date', 'Rail Line', 'Number of service disruptions',
				'Delay Hours' ];
		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);
		// query.setQuery("select A, I, year(G) label I 'Rail Line'");
		// Left truncate the data to begin Jan 2009
		query.setQuery("select G, I, count(A), sum(Q)/60 "
				+ "where G > date '2008-12-31' " + "group by G, I "
				+ "order by G " + "label I '" + columns[1] + "', G '"
				+ columns[0] + "', count(A) '" + columns[2] + "', sum(Q)/60 '"
				+ columns[3] + "' format G 'MMM yyyy', sum(Q)/60 '#,###.#'");
		query.send(FailRail.Charter.drawDashboard1);
	},

	// This dashboard shows number of service disruptions
	// and total delay (hours) for a single selected rail line.
	drawDashboard1 : function(response) {

		var dashboardId = "db1-dashboard";

		var data = response.getDataTable();

		// console.log("FailRail.Charter.drawDashboard1 has been called, DATA: "
		// + data.toJSON());

		// Create a dashboard.
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Filter by rail line
		var lineControl = new google.visualization.ControlWrapper({
			'controlType' : 'CategoryFilter',
			'containerId' : 'db1-control1',
			'options' : {
				'filterColumnLabel' : 'Rail Line',
				'ui' : {
					'labelStacking' : 'horizontal',
					'allowTyping' : false,
					'allowMultiple' : false
				}
			},
			'state' : {
				'selectedValues' : [ 'East-West Line' ]
			}
		});

		// Range filter for number of service disruptions
		var volumeControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'db1-control2',
			'options' : {
				'filterColumnLabel' : 'Number of service disruptions',
				'ui' : {
					'labelStacking' : 'horizontal'
				}
			}
		});

		// Range filter for number of service disruptions
		var delayControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'db1-control3',
			'options' : {
				'filterColumnLabel' : 'Delay Hours',
				'ui' : {
					'labelStacking' : 'horizontal'
				}
			}
		});

		// Filter by date range
		var dateControl = new google.visualization.ControlWrapper({
			'controlType' : 'ChartRangeFilter',
			'containerId' : 'db1-control4',
			'options' : {
				// Filter by Date column
				'filterColumnLabel' : 'Date',
				'ui' : {
					'chartType' : 'AreaChart',
					'chartOptions' : {
						'chartArea' : {
							'width' : '95%' // <100% width so that range slider
						// thumbs can be seen
						},
						'hAxis' : {
							'baselineColor' : 'none'
						}
					},
					// x-axis is column 0, date of event
					// series 1 is column 3, time length of delay
					'chartView' : {
						'columns' : [ 0, 3 ]
					}
				}
			},
			// Initial selected range
			'state' : {
				'range' : {
					'start' : new Date(2012, 0, 1), // months are zero-indexed!
					'end' : new Date(2013, 0, 1)
				}
			}
		});

		// Area chart plotting number of service disruptions and
		// total delay hours by each rail line
		var areaChart = new google.visualization.ChartWrapper({
			'chartType' : 'AreaChart',
			'containerId' : 'db1-chart1',
			'options' : {
				'legend' : {
					'position' : 'top'
				},
				'chartArea' : {
					'width' : '95%' // same width as the ChartRangeFilter to
				// display nicely
				}
			// 'animation' : {
			// 'duration' : 4000
			// }
			}
		});
		areaChart.setView({
			'columns' : [ 0, 2, 3 ]
		});

		// Show query results in a table
		var tableChart = new google.visualization.ChartWrapper({
			'chartType' : 'Table',
			'containerId' : 'db1-chart2',
			'options' : {
			// 'width' : '1200px'
			}
		});

		dashboard.bind(
				[ lineControl, dateControl, volumeControl, delayControl ], [
						areaChart, tableChart ]);

		dashboard.draw(data);
	},

	lineDelayFrequency : function() {

		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);

		//
		query.setQuery("select G, I, count(A) "
				+ "where G >= date '2011-12-01' " 
				+ "and K != 'Others' and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by G, I " + "pivot AA "
				+ // duration bin
				"order by G " + // in chronological order
				"label I 'Rail Line' " + ", G 'Date' " + ", count(A) '' " 
				+ "format G 'MMM yyyy', count(A) '###' ");
		query.send(FailRail.Charter.lineDelayFrequencyDashboard);
	},

	lineDelayFrequencyDashboard : function(response) {

		var dashboardId = "db-line-dfreq";

		var data = response.getDataTable();

		// console.log("FailRail.Charter.drawDashboard2 has been called, DATA: "
		// + data.toJSON());

		// Create a dashboard.
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Filter by rail line
		var lineControl = new google.visualization.ControlWrapper({
			'controlType' : 'CategoryFilter',
			'containerId' : 'control1',
			'options' : {
				'filterColumnLabel' : 'Rail Line',
				'ui' : {
					'labelStacking' : 'horizontal',
					'allowTyping' : false,
					'allowMultiple' : false
				}
			},
			'state' : {
				'selectedValues' : [ 'North-South Line' ]
			}
		});

		

		// Number of service disruptions by category (month-on-month)
		var histoChart = new google.visualization.ChartWrapper({
			"chartType" : "ColumnChart",
			"containerId" : "chart1",
			"options" : {
				"title" : "Number of Service Disruptions by Length of Delay (month-on-month)",
				"legend" : {
					"position" : "top",
					"alignment" : "left",
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"top" : 40,
					"left" : 0
				},
				"vAxis" : {
					"title" : "",
					"textPosition" : "in",
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"hAxis" : {
					"title" : "",
					"textPosition" : "out",
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"focusTarget" : "category",
				"colors" : [ "#0066ff", "#009900", "#ff9900", "#ff3333" ], // blue,green,orange,red
				"isStacked" : true
			}
		});
		histoChart.setView({
			"columns" : [ 0, 2, 3, 4, 5 ]
		});

		// Show query results in a table
		// var tableChart = new google.visualization.ChartWrapper({
		// 'chartType' : 'Table',
		// 'containerId' : 'table-chart'
		// });

		dashboard.bind([ lineControl ], [ histoChart ]);

		dashboard.draw(data);
	},
	
	incidentsCount : function(params) {
		var fromDate, toDate, minDuration, title;
		
		// Set defaults
		// Disruptions that delay more than 30 minutes
		// between 2010 and June 2013

		if (params === undefined || Util.String.isBlank(params.fromDate)) {
			fromDate = "2010-01-01";
		} else {
			fromDate = params.fromDate;
		}
		
		if (params === undefined || Util.String.isBlank(params.toDate)) {
			toDate = "2013-07-01";
		} else {
			toDate = params.toDate;
		}
		
		if (params === undefined || Util.String.isBlank(params.minDuration)) {
			minDuration = "31";
		} else {
			minDuration = params.minDuration;
		}
		
		title = "Number of Service Disruptions Exceeding 30 Minutes In Duration ("
			+ Util.DateTime.getMonthName(parseInt(fromDate.slice(5,7), 10) - 1)
			+ " "
			+ fromDate.slice(0,4)
			+ " - "
			+ Util.DateTime.getMonthName(parseInt(toDate.slice(5,7), 10) - 1)
			+ " "
			+ toDate.slice(0,4)
			+ ")";
		
		var chart = new google.visualization.ChartWrapper({
			"containerId" : "incidents-count",
			"chartType" : "BarChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			
			// cannot sort count if pivot by Category(K)
			
			"query" : "select I, count(A) "
				+ "where R >= date '"
				+ fromDate
				+ "' and R < date '"
				+ toDate
				+ "' "
				+ "and Q >= "
				+ minDuration
				+ " and K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by I "
				+ "pivot K ",
			"options" : {
				"title" : title,
				"hAxis" : {
					"textStyle" : {
						"fontSize" : 14
					},
					"format" : "#"
				},
				"vAxis" : {
					"title" : "",
					"textPosition" : "out"
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "95%",
					"height" : "80%",
					"top" : 50,
					"left" : 130
				},
				"focusTarget" : "category",
				"isStacked" : true
			}
		});
		chart.draw();
	},
	
	incidents : function(params) {
		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);
		
		var fromDate, toDate, minDuration;
		
		// Set defaults for query params
		// Disruptions that delay more than 30 minutes
		// between 2010 and June 2013

		if (params === undefined || Util.String.isBlank(params.fromDate)) {
			fromDate = "2010-01-01";
		} else {
			fromDate = params.fromDate;
		}
		
		if (params === undefined || Util.String.isBlank(params.toDate)) {
			toDate = "2013-07-01";
		} else {
			toDate = params.toDate;
		}
		
		if (params === undefined || Util.String.isBlank(params.minDuration)) {
			minDuration = "31";
		} else {
			minDuration = params.minDuration;
		}
		
		// Default selected rail line: North-South Line
		
		if (params === undefined || Util.String.isBlank(params.railLine)) {
			window.selectedRailLine = "North-South Line";
		} else {
			window.selectedRailLine = params.railLine;
		}
		
		query.setQuery("select A, B, R, K, Q/60, I, year(R) "
				+ "where R >= date '"
				+ fromDate
				+ "' and R < date '"
				+ toDate
				+ "' "
				+ " and Q >= " 
				+ minDuration
				+ " and K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "order by R desc "
				+ "label Q/60 'Duration (Hours)', R 'Date', I 'Rail Line', A 'Incident', year(R) 'Year' "
				+ "format Q/60 '#.#', R 'dd MMM yyyy' ");
		query.send(FailRail.Charter.incidentsDashboard);
	},
	
	incidentsDashboard : function(response) {

		var dashboardId = "incidents";

		var data = response.getDataTable();
		
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));
		
		// Filter rail line
		
		var lineControl = new google.visualization.ControlWrapper({
			"controlType" : "CategoryFilter",
			"containerId" : dashboardId + "-control1",
			"options" : {
				"filterColumnLabel" : "Rail Line",
				"ui" : {
					"labelStacking" : "horizontal",
					"allowTyping" : false,
					"allowMultiple" : false
				}
			},
			"state" : {
				"selectedValues" : [ window.selectedRailLine ]
			}
		});
		
		// Filter year
		
		var yearControl = new google.visualization.ControlWrapper({
			"controlType" : "CategoryFilter",
			"containerId" : dashboardId + "-control2",
			"options" : {
				"filterColumnLabel" : "Year",
				"ui" : {
					"labelStacking" : "horizontal",
					"allowTyping" : false,
					"allowMultiple" : false,
					"caption" : "Everything"
				}
			}
		});
		
		// Filter category (cause of delay)
		
		var categoryControl = new google.visualization.ControlWrapper({
			"controlType" : "CategoryFilter",
			"containerId" : dashboardId + "-control3",
			"options" : {
				"filterColumnLabel" : "Category",
				"ui" : {
					"labelStacking" : "horizontal",
					"allowTyping" : false,
					"allowMultiple" : false,
					"caption" : "Everything"
				}
			}
		});
		
		// Filter length of delay
		
		var durationControl = new google.visualization.ControlWrapper({
			"controlType" : "NumberRangeFilter",
			"containerId" : dashboardId + "-control4",
			"options" : {
				"filterColumnLabel" : "Duration (Hours)",
				"ui" : {
					"labelStacking" : "horizontal",
					"orientation" : "horizontal",
					"unitIncrement" : 1
				}
			}
		});
		
		var tableChart = new google.visualization.ChartWrapper({
			"chartType" : "Table",
			"containerId" : dashboardId + "-chart1",
			"options" : {
				"showRowNumber" : true,
				"page" : "disable",
				"height" : "40em",
				"width" : "100%"
			}
		});
		
		tableChart.setView({
			
			// Do not show year column
			// Show date column instead
			
			"columns" : [ 0, 1, 2, 3, 4, 5 ]
		});
		
		dashboard.bind([ lineControl, yearControl, categoryControl, durationControl ], [ tableChart ]);

		dashboard.draw(data);
	},

	lineFaultTimeSeries : function() {

		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);

		// Left truncate the data to begin Jan 2011
		query.setQuery("select G, I, count(A), sum(Q)/60 "
				+ "where G >= date '2011-12-01' " 
				+ "and K != 'Others' and K != 'Person hit by train' "
				+ "group by G, I "
				+ "pivot K " + "order by G " + "label I 'Rail Line"
				+ "', G 'Date" + "', count(A) '', sum(Q)/60 '' "
				+ "format sum(Q)/60 '#.# hours', G 'MMM yyyy' ");
		query.send(FailRail.Charter.lineFaultTimeSeriesDashboard);
	},

	// This dashboard shows number of service disruptions
	// and total delay (hours) drill down by rail line and delay category
	lineFaultTimeSeriesDashboard : function(response) {

		var dashboardId = "db-line-faultts";

		var data = response.getDataTable();

		// Create a dashboard.
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Filter by rail line
		var lineControl = new google.visualization.ControlWrapper({
			'controlType' : 'CategoryFilter',
			'containerId' : 'control1',
			'options' : {
				'filterColumnLabel' : 'Rail Line',
				'ui' : {
					'labelStacking' : 'horizontal',
					'allowTyping' : false,
					'allowMultiple' : false
				}
			},
			'state' : {
				'selectedValues' : [ 'North-South Line' ]
			}
		});

		// Number of service disruptions by category (month-on-month)
		var countDisruptionChart = new google.visualization.ChartWrapper(
				{
					"chartType" : "ColumnChart",
					"containerId" : "chart1",
					"options" : {
						"title" : "Number of Service Disruptions by Category (month-on-month)",
						"legend" : {
							"position" : "top",
							"textStyle" : {
								"fontSize" : 12
							}
						},
						"vAxis" : {
							"format" : "#",
							"textPosition" : "in",
							"textStyle" : {
								"fontSize" : 14
							}
						},
						"hAxis" : {
							"format" : "",
							"textPosition" : "out",
							"textStyle" : {
								"fontSize" : 14
							}
						},
						"chartArea" : {
							"width" : "100%",
							"height" : "80%",
							"left" : 0,
							"top" : 45
						},
						"focusTarget" : "category",
						"bar" : {
							"groupWidth" : "45%"
						},
						"isStacked" : true
					}
				});
		countDisruptionChart.setView({
			"columns" : [ 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
		});

		// Total delay hours by category (month-on-month)
		var sumDelayChart = new google.visualization.ChartWrapper({
			"chartType" : "ColumnChart",
			"containerId" : "chart2",
			"options" : {
				"title" : "Delay Hours by Category (month-on-month)",
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"vAxis" : {
					"format" : "#.# hrs",
					"textPosition" : "in",
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"hAxis" : {
					"format" : "",
					"textPosition" : "out",
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"left" : 0,
					"top" : 45
				},
				"focusTarget" : "category",
				"bar" : {
					"groupWidth" : "45%"
				},
				"isStacked" : true
			}
		});
		sumDelayChart.setView({
			"columns" : [ 0, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 ]
		});

		dashboard.bind([ lineControl ], [ countDisruptionChart,
				sumDelayChart ]);

		dashboard.draw(data);
	},

	// Query for Major Disruptions dashboard and Fines report
	majorDisruptions : function(scope) {

		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);

		query.setQuery("select A, I, K, M, N, O, P, Q/60, R "
				+ "where (M = 1 or M >= 20000 or P > 0) " + // Major disruption
				// 1 commuter affected means unknown number of commuters
				// The service operator was penalised with a fine
				"and K != 'Person hit by train' " + // Not the fault of service
				// operators
				"and R > date '2005-12-31' " + //Filter out disruptions before 2006
				"order by G desc " + "label Q/60 'Delay Hours' "
				+ ", M 'Commuters Affected' " + ", N 'Buses Deployed' "
				+ ", O 'Staff Deployed' " + ", P 'Fine Amount ($)' "
				+ ", I 'Rail Line' " + ", K 'Category' " + ", A 'Incident' "
				+ ", R 'Date' " + "format Q/60 '#,###.#'" + ", R 'dd MMM yyyy'"
				+ ", M '###,###'");

		if (scope === 'report') {
			query.send(FailRail.Charter.finesReport);
		} else {
			query.send(FailRail.Charter.majorDisruptionsDashboard);
		}
	},

	// Draw the Fines report
	finesReport : function(response) {
		var dashboardId = "fines-dashboard";

		var data = response.getDataTable();

		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Range filter for fine amount
		var fineControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'fines-control1',
			'options' : {
				'filterColumnLabel' : 'Fine Amount ($)',
				'ui' : {
					'labelStacking' : 'horizontal',
					'ticks' : 20,
					'unitIncrement' : 1000,
					'blockIncrement' : 10000
				}
			}
		});

		// Timeline of events, showing fines and impact (number of commuters
		// affected)
		var bubbleChart1 = new google.visualization.ChartWrapper(
				{
					"chartType" : "BubbleChart",
					"containerId" : "fines-chart1",
					"options" : {
						"title" : "Major Service Disruptions by Length of Delay, Fine Amount (bubble colour) and Number of Commuters Affected (bubble size)",
						"legend" : {
							"position" : "top"
						},
						"chartArea" : {
							"width" : "100%",
							"height" : "85%",
							"top" : 50,
							"left" : 30
						},
						"hAxis" : {
							"title" : "",
							"textPosition" : "out",
							"format" : "yyyy"
						},
						"vAxis" : {
							"title" : "Length of Delay (Hours)",
							"textPosition" : "in",
						},
						"sizeAxis" : {
							"minSize" : 10,
							"maxSize" : 80
						},
						"colorAxis" : {
							"colors" : [ "#009900", "yellow", "#ff3333" ], // traffic
							// light
							// colors
							"legend" : {
								"position" : "top",
								"numberFormat" : "$#,###,###"
							}
							
						},
						"bubble" : {
							"textStyle" : {
								"fontSize" : 11
							}
						}
					}
				});

		// ID: Incident summary
		// X-coordinate: Date
		// Y-coordinate: Delay Hours
		// Color: Fine Amount
		// Size: Commuters affected
		bubbleChart1.setView({
			'columns' : [ 0, 8, 7, 6, 3 ]
		});

		// Show query results in a table
		var tableChart = new google.visualization.ChartWrapper({
			'chartType' : 'Table',
			'containerId' : 'fines-chart2'
		});
		tableChart.setView({
			'columns' : [ 0, 1, 2, 3, 4, 5, 6, 7 ]
		});

		dashboard.bind([ fineControl ], [ tableChart, bubbleChart1 ]);

		dashboard.draw(data);
	},

	// Draw Major Disruptions dashboard
	majorDisruptionsDashboard : function(response) {

		var dashboardId = "majord-dashboard";

		var data = response.getDataTable();

		// console.log("FailRail.Charter.drawDashboard3 has been called, DATA: "
		// + data.toJSON());

		// Create a dashboard.
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Range filter for number of commuters affected
		var commuterControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'majord-control3',
			'options' : {
				'filterColumnLabel' : 'Commuters Affected',
				'ui' : {
					'labelStacking' : 'horizontal',
					'orientation' : 'vertical'
				}
			}
		});

		// Range filter for delay duration
		var durationControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'majord-control4',
			'options' : {
				'filterColumnLabel' : 'Delay Hours',
				'ui' : {
					'labelStacking' : 'horizontal',
					'orientation' : 'vertical'
				}
			},
			'state' : {
			// 'lowValue' : 2
			}
		});

		// Range filter for fine amount
		var fineControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'majord-control5',
			'options' : {
				'filterColumnLabel' : 'Fine Amount ($)',
				'ui' : {
					'labelStacking' : 'horizontal',
					'orientation' : 'vertical',
					'ticks' : 20,
					'unitIncrement' : 1000,
					'blockIncrement' : 10000
				}
			}
		});

		// Range filter for buses deployed
		var busControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'majord-control1',
			'options' : {
				'filterColumnLabel' : 'Buses Deployed',
				'ui' : {
					'labelStacking' : 'horizontal',
					'orientation' : 'vertical'
				}
			},
			'state' : {
			// 'lowValue' : 10
			}
		});

		// Range filter for staff deployed
		var staffControl = new google.visualization.ControlWrapper({
			'controlType' : 'NumberRangeFilter',
			'containerId' : 'majord-control2',
			'options' : {
				'filterColumnLabel' : 'Staff Deployed',
				'ui' : {
					'labelStacking' : 'horizontal',
					'orientation' : 'vertical'
				}
			},
			'state' : {
			// 'lowValue' : 10
			}
		});

		// buses, staff, delay hours, commuters
		var crisisResponseChart = new google.visualization.ChartWrapper(
				{
					"chartType" : "BubbleChart",
					"containerId" : "majord-chart2",
					"options" : {
						"title" : "Crisis Response by Number of Commuters Affected (bubble size), Delay Hours (bubble colour)",
						"titlePosition" : "out",
						"axisTitlesPosition" : "out",
						"legend" : {
							"position" : "none"
						},
						"chartArea" : {
							"width" : "95%",
							"height" : "85%",
							"top" : 50,
							"left" : 40
						},
						"hAxis" : {
							"title" : "Number of Buses Deployed",
							"textPosition" : "in",
						},
						"vAxis" : {
							"title" : "Number of Staff Deployed",
							"textPosition" : "in",
						},
						"sizeAxis" : {
							"minSize" : 10,
							"maxSize" : 80
						},
						"colorAxis" : {
							"colors" : [ "#ff3333" ], // light red
							"legend" : {
								"position" : "top",
								"numberFormat" : "#"
							}
						},
						"bubble" : {
							"textStyle" : {
								"fontSize" : 11
							}
						}
					}
				});

		// ID: Incident
		// X-coordinate: Buses deployed
		// Y-coordinate: Staff deployed
		// Color: Delay Hours
		// Size: Commuters affected
		crisisResponseChart.setView({
			'columns' : [ 0, 4, 5, 7, 3 ]
		});

		// Adequacy of the bus bridging service
		var busChart = new google.visualization.ChartWrapper(
				{
					"chartType" : "BubbleChart",
					"containerId" : "majord-chart3",
					"options" : {
						"title" : "Bus Bridging Service by Number of Commuters Affected (bubble size), Delay Hours (bubble colour)",
						"titlePosition" : "out",
						"axisTitlesPosition" : "out",
						"legend" : {
							"position" : "top"
						},
						"chartArea" : {
							"width" : "95%",
							"height" : "85%",
							"top" : 50,
							"left" : 40
						},
						"hAxis" : {
							"title" : "Year",
							"textPosition" : "in",
							"format" : "yyyy"
						},
						"vAxis" : {
							"title" : "Number of Buses Deployed",
							"textPosition" : "in",
						},
						"sizeAxis" : {
							"minSize" : 10,
							"maxSize" : 80
						},
						"colorAxis" : {
							"colors" : [ "#ff3333" ], // light red
							"legend" : {
								"position" : "top",
								"numberFormat" : "#"
							}
						},
						"bubble" : {
							"textStyle" : {
								"fontSize" : 11
							}
						}
					}
				});

		// ID: Incident
		// X-coordinate: Date
		// Y-coordinate: Buses Deployed
		// Color: Delay Hours
		// Size: Commuters affected
		busChart.setView({
			'columns' : [ 0, 8, 4, 7, 3 ]
		});

		var timeChart = new google.visualization.ChartWrapper(
				{
					"chartType" : "BubbleChart",
					"containerId" : "majord-chart1",
					"options" : {
						"title" : "Time Series of Major Disruptions vs. Fault Type (bubble colour), Commuters Affected (bubble size)",
						"legend" : {
							"position" : "top"
						},
						"chartArea" : {
							"width" : "95%",
							"height" : "85%",
							"top" : 40,
							"left" : 40
						},
						"hAxis" : {
							"title" : "Year",
							"textPosition" : "in",
							"format" : "yyyy"
						},
						"vAxis" : {
							"title" : "Length of Delay (Hours)",
							"textPosition" : "in",
						},
						"sizeAxis" : {
							"minSize" : 10,
							"maxSize" : 80
						},
						"bubble" : {
							"textStyle" : {
								"fontSize" : 11
							}
						}
					}
				});

		// ID: Incident
		// X-coordinate: Date
		// Y-coordinate: Delay Hours
		// Color: Category
		// Size: Commuters affected
		timeChart.setView({
			'columns' : [ 0, 8, 7, 2, 3 ]
		});

		// Show query results in a table
		var tableChart = new google.visualization.ChartWrapper({
			'chartType' : 'Table',
			'containerId' : 'majord-chart4'
		});
		tableChart.setView({
			'columns' : [ 0, 1, 2, 3, 4, 5, 6, 7 ]
		});

		dashboard.bind([ commuterControl, durationControl, fineControl,
				busControl, staffControl ], [ tableChart, crisisResponseChart,
				busChart, timeChart ]);

		dashboard.draw(data);
	},

	queryReport1 : function() {

		var query = new google.visualization.Query(
				FailRail.Charter.dataSourceUrl);

		// Left truncate the data to begin Dec 2011
		query.setQuery("select G, I, count(A), sum(Q)/60 "
				+ "where G > date '2011-11-30' " + "group by G, I "
				+ "pivot K " + "order by G " + "label I 'Rail Line'"
				+ ", G 'Date'" + ", count(A) ''" + // label as empty string
				", sum(Q)/60 '' " + // label as empty string
				"format G 'MMM yyyy', sum(Q)/60 '#,###.#'");
		query.send(FailRail.Charter.drawReport1);
	},

	// This dashboard shows number of service disruptions
	// and total delay (hours) drill down by rail line and delay category
	drawReport1 : function(response) {

		var dashboardId = "rpt1-dashboard";

		var data = response.getDataTable();

		// console.log("FailRail.Charter.drawReport1 has been called, DATA: " +
		// data.toJSON());

		// Create a dashboard.
		var dashboard = new google.visualization.Dashboard(document
				.getElementById(dashboardId));

		// Filter by rail line
		var lineControl = new google.visualization.ControlWrapper({
			'controlType' : 'CategoryFilter',
			'containerId' : 'rpt1-control1',
			'options' : {
				'filterColumnLabel' : 'Rail Line',
				'ui' : {
					'labelStacking' : 'horizontal',
					'allowTyping' : false,
					'allowMultiple' : false
				}
			},
			'state' : {
				'selectedValues' : [ 'East-West Line' ]
			}
		});

		// Number of service disruptions by category (month-on-month)
		var countDisruptionChart = new google.visualization.ChartWrapper(
				{
					'chartType' : 'ColumnChart',
					'containerId' : 'rpt1-chart1',
					'options' : {
						'title' : 'Number of service disruptions by category (month-on-month)',
						'legend' : {
							'position' : 'bottom',
							'textStyle' : {
								'fontSize' : 12
							}
						},
						'chartArea' : {
							'width' : '95%'
						},
						'focusTarget' : 'category',
						'bar' : {
							'groupWidth' : '45%'
						},
						'isStacked' : true
					}
				});
		countDisruptionChart.setView({
			'columns' : [ 0, 2, 3, 4, 5, 6, 7, 8, 9 ]
		});

		// Total delay hours by category (month-on-month)
		var sumDelayChart = new google.visualization.ChartWrapper({
			'chartType' : 'ColumnChart',
			'containerId' : 'rpt1-chart2',
			'options' : {
				'title' : 'Delay hours by category (month-on-month)',
				'legend' : {
					'position' : 'bottom',
					'textStyle' : {
						'fontSize' : 12
					}
				},
				'chartArea' : {
					'width' : '95%'
				},
				'focusTarget' : 'category',
				'bar' : {
					'groupWidth' : '45%'
				},
				'isStacked' : true
			}
		});
		sumDelayChart.setView({
			'columns' : [ 0, 10, 11, 12, 13, 14, 15, 16, 17 ]
		});

		/*
		 * // Show query results in a table for debugging var tableChart = new
		 * google.visualization.ChartWrapper({ 'chartType' : 'Table',
		 * 'containerId' : 'db2-chart3' });
		 */

		dashboard
				.bind([ lineControl ], [ countDisruptionChart, sumDelayChart ]);

		dashboard.draw(data);
	},

	emergencyButton : function(scope) {

		// Count emergency button activations daily
		var wrapper = new google.visualization.ChartWrapper(
				{
					"containerId" : "ecb-chart1",
					"chartType" : "AnnotatedTimeLine",
					"dataSourceUrl" : "https://docs.google.com/spreadsheet/pub?key=0AkdFf0ojY-LPdG52LWlpYU5kOG5USVpVbHAxMW5YSXc&headers=1&gid=11",
					"query" : "select B, count(A) group by B label count(A) 'Emergency button activations'",
					"options" : {
						"dateFormat" : 'dd MMMM yyyy',
						"fill" : 20
					// "displayAnnotations" : true
					}
				});
		wrapper.draw();

		if (scope === 'all') {
			// Count emergency button activations by category since 01 Oct 2012
			wrapper = new google.visualization.ChartWrapper(
					{
						"containerId" : "ecb-chart2",
						"chartType" : "BarChart",
						"dataSourceUrl" : "https://docs.google.com/spreadsheet/pub?key=0AkdFf0ojY-LPdG52LWlpYU5kOG5USVpVbHAxMW5YSXc&headers=1&gid=11",
						"query" : "select F, count(A) where B > date '2012-09-30' group by F order by count(A) desc label count(A) 'Emergency button activations'",
						"options" : {
							"legend" : {
								"position" : "none"
							},
							"title" : "Emergency Button Activations By Category (1 October - 5 November 2012)",
							"chartArea" : {
								"width" : "80%",
								"height" : "85%",
								"left" : 250,
								"top" : 25
							}
						}
					});
			wrapper.draw();

			// Count emergency button activations by category
			// Pivot by time of day
			wrapper = new google.visualization.ChartWrapper(
					{
						"containerId" : "ecb-chart3",
						"chartType" : "ColumnChart",
						"dataSourceUrl" : "https://docs.google.com/spreadsheet/pub?key=0AkdFf0ojY-LPdG52LWlpYU5kOG5USVpVbHAxMW5YSXc&headers=1&gid=11",
						"query" : "select hour(C), count(A) where B > date '2012-09-30' group by hour(C) pivot F format hour(C) '##.00 Hours'",
						"options" : {
							"title" : "Emergency Button Activations By Time of Day (1 October - 5 November 2012)",
							"legend" : {
								"position" : "top",
								"textStyle" : {
									"fontSize" : 12
								}
							},
							"chartArea" : {
								"width" : "100%",
								"height" : "80%",
								"left" : 0,
								"top" : 40
							},
							"hAxis" : {
								"title" : "",
								"textPosition" : "out"
							},
							"vAxis" : {
								"title" : "",
								"textPosition" : "in"
							},
							"focusTarget" : "category",
							"isStacked" : true
						}
					});
			wrapper.draw();

			// Count emergency button activations by train station
			// Filter out train station names that are null
			wrapper = new google.visualization.ChartWrapper(
					{
						"containerId" : "ecb-chart4",
						"chartType" : "BarChart",
						"dataSourceUrl" : "https://docs.google.com/spreadsheet/pub?key=0AkdFf0ojY-LPdG52LWlpYU5kOG5USVpVbHAxMW5YSXc&headers=1&gid=11",
						"query" : "select D, count(A) where D is not null group by D label count(A) 'Emergency button activations'",
						"options" : {
							"legend" : {
								"position" : "none"
							},
							"hAxis" : {
								"title" : "",
								"textStyle" : {
									"fontSize" : 12
								}
							},
							"title" : "Emergency Button Activations By Train Station (12 September - 5 November 2012)",
							"chartArea" : {
								"width" : "80%",
								"height" : "90%",
								"left" : 200,
								"top" : 30
							},
							"vAxis" : {
								"textStyle" : {
									"fontSize" : 12
								}
							}
						}
					});
			wrapper.draw();
		}

	},

	smrtTweetFreq : function() {
		var smrtTweetFreqChart = new google.visualization.ChartWrapper({
			"containerId" : "smrt-tweet-freq-chart",
			"chartType" : "ColumnChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select G, count(A) "
				+ "where G > date '2011-12-16' "
				+ "and Z contains 'twitter.com/' "
				+ "group by G "
				+ "label count(A) 'Number of Train Service Delays Tweeted' "
				+ ", G 'Month and Year' "
				+ "format G 'MMM yyyy' ",
			"options" : {
				"title" : "Number of Train Service Delays Tweeted by SMRT",
				'legend' : {
					'position' : 'none'
				},
				'chartArea' : {
					'width' : '93%'
				// max width so that axis text will not be cropped
				}
			}
		});
		smrtTweetFreqChart.draw();
	},
	
	// Charts for Overview page
	overview : function() {
		
		// Chart data excludes suicide attempts,
		// maintenance/upgrading works
		// and Act of God events.
		
		var volumeChart = new google.visualization.ChartWrapper({
			"containerId" : "chart4",
			"chartType" : "PieChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select I, count(A) " 
					+ "where K != 'Others' "
					+ "and K != 'Person hit by train' "
					+ "and K != 'Maintenance/Upgrading' "
					+ "group by I "
					+ "order by count(A) desc "
					+ "format count(A) '#,###' ",
			"options" : {
				"title" : "Share of Service Disruptions By Rail Line",
				"chartArea" : {
					"width" : "100%",
					"height" : "100%",
					"top" : 25
				},
				"legend" : {
					"position" : "right"
				},
				"slices" : {
					0 : {
						color : 'green'
					},
					1 : {
						color : 'red'
					},
					2 : {
						color : 'darkturquoise'
					},
					3 : {
						color : 'orange'
					},
					4 : {
						color : 'purple'
					}
				},
				"pieSliceText" : "value"
			}
		});
		volumeChart.draw();

		durationChart = new google.visualization.ChartWrapper({
			"containerId" : "chart5",
			"chartType" : "PieChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select I, sum(Q)/60 "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by I "
				+ "order by sum(Q)/60 desc "
				+ "format sum(Q)/60 '#,###' ",
			"options" : {
				"title" : "Share of Delay Hours By Rail Line",
				"chartArea" : {
					"width" : "100%",
					"height" : "100%",
					"top" : 25
				}, 
				"legend" : {
					"position" : "right"
				},
				"slices" : {
					0 : {
						color : "darkturquoise"
					},
					1 : {
						color : "red"
					},
					2 : {
						color : "green"
					},
					3 : {
						color : "purple"
					},
					4 : {
						color : "orange"
					}
				},
				"pieSliceText" : "value",
			}
		});
		durationChart.draw();
		
		categoryVolumeChart = new google.visualization.ChartWrapper({
			"containerId" : "chart6",
			"chartType" : "ColumnChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			
			// cannot sort count if pivot by Category(K)
			
			"query" : "select I, count(A) "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by I "
				+ "pivot K ",
			"options" : {
				"title" : "Number of Service Disruptions by Category",
				"hAxis" : {
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"vAxis" : {
					"title" : "",
					"textPosition" : "in"
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"top" : 45,
					"left" : 0
				},
				"focusTarget" : "category",
				"isStacked" : false
			}
		});
		categoryVolumeChart.draw();
		
		categoryDurationChart = new google.visualization.ChartWrapper({
			"containerId" : "chart7",
			"chartType" : "ColumnChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select I, sum(Q)/60 "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "and Q < 6000 "
				+ "group by I "
				+ "pivot K " 
				+ "label sum(Q)/60 '' " 
				+ "format sum(Q)/60 '#,###.# hours'",
			"options" : {
				"title" : "Cumulative Delay Hours by Category",
				"hAxis" : {
					"textStyle" : {
						"fontSize" : 14
					}
				},
				"vAxis" : {
					"title" : "",
					"textPosition" : "in"
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"top" : 45,
					"left" : 0
				},
				"focusTarget" : "category",
				"isStacked" : false
			}
		});
		categoryDurationChart.draw();
		
		durationHistogram = new google.visualization.ChartWrapper({
			"containerId" : "chart2",
			"chartType" : "ColumnChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select I, count(A) "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by I "
				+ "pivot AA ",
			"options" : {
				"title" : "Number of Service Disruptions by Length of Delay",
				"vAxis" : {
					"title" : "",
					"textPosition" : "in"
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"top" : 45,
					"left" : 0
				},
				"colors" : [ "#0066ff", "#009900", "#ff9900", "#ff3333" ], // blue,green,orange,red
				"focusTarget" : "category",
				"isStacked" : false
			}
		});
		durationHistogram.draw();
		
		categoryDurationHistogram = new google.visualization.ChartWrapper({
			"containerId" : "chart3",
			"chartType" : "BarChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select K, count(A) "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by K "
				+ "pivot AA ",
			"options" : {
				"title" : "Number of Service Disruptions By Length of Delay",
				"vAxis" : {
					"title" : "",
					"textPosition" : "out"
				},
				"hAxis" : {
					"textPosition" : "out",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "65%",
					"height" : "85%",
					"top" : 40
				},
				"colors" : [ "#0066ff", "#009900", "#ff9900", "#ff3333" ], // blue,green,orange,red
				"focusTarget" : "category",
				"isStacked" : false
			}
		});
		categoryDurationHistogram.draw();
		
		timeOfDayDurationHistogram = new google.visualization.ChartWrapper({
			"containerId" : "chart1",
			"chartType" : "ColumnChart",
			"dataSourceUrl" : FailRail.Charter.dataSourceUrl,
			"query" : "select AC, count(A) "
				+ "where K != 'Others' "
				+ "and K != 'Person hit by train' "
				+ "and K != 'Maintenance/Upgrading' "
				+ "group by AC "
				+ "pivot AA "
				+ "format AC 'haa'",
			"options" : {
				"title" : "Number of Service Disruptions By Time of Day",
				"vAxis" : {
					"title" : "",
					"textPosition" : "in"
				},
				"hAxis" : {
					"title" : "",
					"textPosition" : "out"
				},
				"legend" : {
					"position" : "top",
					"textStyle" : {
						"fontSize" : 12
					}
				},
				"chartArea" : {
					"width" : "100%",
					"height" : "80%",
					"top" : 45,
					"left" : 0
				},
				"colors" : [ "#0066ff", "#009900", "#ff9900", "#ff3333" ], // blue,green,orange,red
				"focusTarget" : "category",
				"isStacked" : true
			}
		});
		timeOfDayDurationHistogram.draw();
	}

};

var Util = {};

Util.DateTime = {
	
	daysAgo : function(from) {
		var to = new Date();
		return Math.floor((to - from)/1000/60/60/24);
	},

	getMonthName : function(index) {
		if (index === 1) return "February";
		if (index === 2) return "March";
		if (index === 3) return "April";
		if (index === 4) return "May";
		if (index === 5) return "June";
		if (index === 6) return "July";
		if (index === 7) return "August";
		if (index === 8) return "September";
		if (index === 9) return "October";
		if (index === 10) return "November";
		if (index === 11) return "December";
		return "January";
	}
};

Util.String = {

	// String utiliy functions
	// @url:
	// http://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript

	isEmpty : function(str) {
		return (!str || 0 === str.length);
	},

	isBlank : function(str) {
		return (!str || /^\s*$/.test(str));
	}
};
