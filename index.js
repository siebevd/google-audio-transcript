// Imports the Google Cloud client library
const speech = require("@google-cloud/speech");
const fs = require("fs");

// Creates a client
const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const gcsUri = 'gs://my-bucket/audio.raw';
// const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'BCP-47 language code, e.g. en-US';

// const config = {
//   encoding: encoding,
//   sampleRateHertz: sampleRateHertz,
//   languageCode: languageCode,
// };

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const filename = "./mp3-test.mp3";
const encoding = "MP3";
const sampleRateHertz = 16000;
const languageCode = "en-US";

const config = {
  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  languageCode: languageCode,
  enableWordTimeOffsets: true,
};

/**
 * Note that transcription is limited to 60 seconds audio.
 * Use a GCS file for audio longer than 1 minute.
 */
const audio = {
  content: fs.readFileSync(filename).toString("base64"),
};

const request = {
  config: config,
  audio: audio,
};

const runFunction = async () => {
  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);

  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();

  fs.writeFileSync("result.json", JSON.stringify(response));
  response.results.forEach((result) => {
    console.log(`Transcription: ${result.alternatives[0].transcript}`);
    result.alternatives[0].words.forEach((wordInfo) => {
      // NOTE: If you have a time offset exceeding 2^32 seconds, use the
      // wordInfo.{x}Time.seconds.high to calculate seconds.
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        "." +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        "." +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
  });
};

runFunction();
