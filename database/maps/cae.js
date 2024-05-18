const fs = require("fs");
const path = require("path");

const directoryPath = "./content-authorization";
const outputFilePath = "combine.json";
const mergedData = {};

function mergeJson() {
  try {
      const files = fs.readdirSync(directoryPath);

          files.forEach((file) => {
            console.log(file)
                const filePath = path.join(directoryPath, file);
                      const data = fs.readFileSync(filePath, "utf8");
                            const jsonData = JSON.parse(data) || {urls:{}};

                                  if (jsonData.urls) {
                                          mergedData[path.basename(file, '.json')] = jsonData.urls;
                                                }
                                                    });

                                                        // Write the merged data to the output file
                                                            fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2));
                                                                console.log("JSON files merged successfully!");
                                                                  } catch (error) {
                                                                      console.error("Error merging JSON files:", error);
                                                                        }
                                                                        }

                                                                        mergeJson();
                                                                        


