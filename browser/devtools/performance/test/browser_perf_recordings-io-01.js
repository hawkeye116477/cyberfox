/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * Tests if the performance tool is able to save and load recordings.
 */

let test = Task.async(function*() {
  let { target, panel, toolbox } = yield initPerformance(SIMPLE_URL);
  let { EVENTS, PerformanceController } = panel.panelWin;

  yield startRecording(panel);
  yield stopRecording(panel);

  // Verify original recording.

  let originalData = PerformanceController.getAllData();
  ok(originalData, "The original recording is not empty.");

  // Save recording.

  let file = FileUtils.getFile("TmpD", ["tmpprofile.json"]);
  file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("666", 8));

  let exported = once(PerformanceController, EVENTS.RECORDING_EXPORTED);
  yield PerformanceController.exportRecording("", file);

  yield exported;
  ok(true, "The recording data appears to have been successfully saved.");

  // Import recording.

  let rerendered = waitForWidgetsRendered(panel);
  let imported = once(PerformanceController, EVENTS.RECORDING_IMPORTED);
  yield PerformanceController.importRecording("", file);

  yield imported;
  ok(true, "The recording data appears to have been successfully imported.");

  yield rerendered;
  ok(true, "The imported data was re-rendered.");

  // Verify imported recording.

  let importedData = PerformanceController.getAllData();

  is(importedData.startTime, originalData.startTime,
    "The impored data is identical to the original data (1).");
  is(importedData.endTime, originalData.endTime,
    "The impored data is identical to the original data (2).");

  is(importedData.markers.toSource(), originalData.markers.toSource(),
    "The impored data is identical to the original data (3).");
  is(importedData.memory.toSource(), originalData.memory.toSource(),
    "The impored data is identical to the original data (4).");
  is(importedData.ticks.toSource(), originalData.ticks.toSource(),
    "The impored data is identical to the original data (5).");
  is(importedData.profilerData.toSource(), originalData.profilerData.toSource(),
    "The impored data is identical to the original data (6).");

  yield teardown(panel);
  finish();
});