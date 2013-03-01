function draw(data) {
    "use strict";

    window.data = data;

    var week = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var container_dims = {width: 900, height: 400},
        margins = {top: 10, right: 20, bottom: 30, left: 100},
        chart_dims = {
            width: container_dims.width - margins.left - margins.right,
            height: container_dims.height - margins.top - margins.bottom
        };

    var time_parse = d3.time.format("%H:%M").parse;

    // We don't use the extent function to keep all days on the axis,
    // even the ones not represented in the dataset.
    var x_scale = d3.scale.linear()
        .domain([0,7])
        .range([200, container_dims.width]);

    var x_axis_scale = d3.scale.linear()
        .domain([0,7])
        .range([0, chart_dims.width]);

    var y_scale = d3.time.scale()
        .domain([time_parse("23:00"), time_parse("00:00")])
        .range([chart_dims.height, 0]);

   var opacity_extent = d3.extent(
        data.response.docs,
        function(d) {
            return d.AnswerCount;
        });

    var rad_extent = d3.extent(
        data.response.docs,
        function(d) {
            return d.Score;
        });

    var rad_scale = d3.scale.linear()
        .domain(rad_extent)
        .range([5,50]);

    var opacity_scale = d3.scale.linear()
        .domain(opacity_extent)
        .range([0.1, 0.8]);

    var tooltip = d3.select("body")
        .append("div")
            .attr("id", "infobox")
            .style("z-index", "10")
            .style("float", "right");

    var chart = d3.select("body")
        .append("svg")
            .attr("width", container_dims.width)
            .attr("height", container_dims.height)
        .append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .attr("id", "chart");

    d3.select("svg")
        .selectAll("circle")
        .data(data.response.docs)
        .enter()
        .append("circle")
            .attr("class", "post");

   d3.selectAll("circle")
        .attr("cy", function(d){
            var time = new Date(d.CreationDate);
            var _time = time.getUTCHours() + ":00";
            return y_scale(time_parse(_time))})
        .attr("cx", function(d){
            return x_scale(new Date(d.CreationDate).getDay())})
        .attr("r", function(d){return rad_scale(d.AnswerCount)})
        .attr("fill-opacity", function(d){return opacity_scale(d.AnswerCount)})
        .on("mouseover", function(d) {
            var infobox = d3.select("#infobox")
                .style("display", "block");

            var title = d.Title,
                body = d.Body,
                time = new Date(d.CreationDate);

            if (title.length > 50) {
                title = title.substring(0, 50) + "...";
            }
            if (body.length > 200) {
                body = body.substring(0,200) + "...";
            }
                
            infobox.append("h3")
                .text(title);
            infobox.append("div")
                .attr("class", "time")
                .text(time.toUTCString());
            infobox.append("div")
                .attr("class", "post-text")
                .text(body);
            infobox.append("div")
                .attr("class", "post-answers")
                .text(d.AnswerCount + " Answers");
            })


        .on("mouseout", function(d) {
            var infobox = d3.select("#infobox")
                .style("display", "none");
            // Remove titles after they're added.
            infobox.selectAll("h3").remove();
            infobox.selectAll("div").remove();
            })
;

    var x_axis = d3.svg.axis().scale(x_axis_scale)
        .tickFormat(function(d, i) {
            return week[d];
        });

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .ticks(d3.time.hours.utc, 4)
        .orient("left");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chart_dims.height + ")")
        .call(x_axis);

    chart.append("g")
        .attr("class", "y axis")
        .call(y_axis);

    $("circle").tipsy({
        gravity: "w",
        html: true,
        title: function() {
            var d = this.__data__;
            return "Answers: " + d.AnswerCount;
        }
    });
}


