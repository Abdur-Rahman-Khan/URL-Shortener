let btnemail = document.getElementById("btnforemail");
btnemail.addEventListener("click", myOtpFunc);

async function myOtpFunc() {
  let email = document.querySelector(".inpemail");
  //Send email to backend
  // console.log(email.value);
  let jsonemail = email.value;
    await fetch("/nonpremiumOTPcreate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonemail }),
    });
  console.log("Sent Post in JS");
  //Show
  document.querySelector(".otpdiv").classList.toggle("advancedHide");
  btnemail.classList.remove("btn");
  btnemail.classList.remove("btn-primary");
  btnemail.classList.add("advancedHide");
}

function genRandColor() {
  const red = Math.random() * 255;
  const green = Math.random() * 255;
  const blue = Math.random() * 255;

  return `rgba(${red} , ${green} , ${blue})`;
}

// const graphData = "<%-graphData%>";
// graphData = JSON.parse(graphData);

// console.log(graphData);

// var data = {
//   labels: graphData.curr_date,
//   datasets: [
//     {
//       label: "Blue",
//       backgroundColor: "blue",
//       data: graphData.read_count,
//     },
//     {
//       label: "Red",
//       backgroundColor: "red",
//       data: graphData.write_count,
//     },
//   ],
// };

// new Chart("myChart", {
//   type: "bar",
//   data,
//   options: {
//     legend: { display: false },
//     title: {
//       display: true,
//       text: "Read and Write in past 10 days",
//     },
//     barValueSpacing: 20,
//     scales: {
//       yAxes: [
//         {
//           ticks: {
//             beginAtZero: true,
//           },
//         },
//       ],
//     },
//   },
// });
