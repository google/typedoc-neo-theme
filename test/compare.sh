#!/bin/bash
#
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
echo "[!] Comparing..."
set -e

# Get every 'expected/' file and compare it against the newly-generated files
# that are in 'docs/'
FILES=()
while IFS=  read -r -d $'\0'; do
    FILES+=("$REPLY")
done < <(find expected/ -type f -print0)
for entry in "${FILES[@]}"
do
    # Obtain the equivalent `docs/` filepath
    doc=$(echo "${entry}" | sed 's/expected/docs/')
    echo "~ Compare ${entry} and ${doc}"
    diff "./${entry}" "./${doc}"
done
echo "OK"
