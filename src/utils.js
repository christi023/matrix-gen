// function to create 2d Array
// pass parameters
function create2dArray() {
  let a = new Array(4);
  let sOut = '<table border=2 class="table"> ';
  for (let i = 0; i < 4; i++) {
    // for each row
    sOut += '<tr class="trow"">';
    a[i] = new Array(4);
    for (let j = 0; j < 4; j++) {
      a[i][j] = '' + j + ', ' + i + '';
      // for each clm
      sOut += '<td class="tdata">' + a[i][j] + '</td>';
    }
    sOut += '</tr>';
  }
  sOut += '</table>';
  return a;
}

module.exports = { create2dArray };
