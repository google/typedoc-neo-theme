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
set -e
# set -x #FIXME
GIT_PRESUBMIT_LINTER='git-presubmit-linter'
RULES="${GIT_PRESUBMIT_LINTER}/rules"

if [ ! -d ${GIT_PRESUBMIT_LINTER} ]; then
    # Clone the git presubmit linter repository
    git clone https://github.com/google/git-presubmit-linter.git
else
    # Already downloaded, fetch HEAD
    cd ${GIT_PRESUBMIT_LINTER}
    git pull origin master
    cd ../
fi

set +e
IFS=$' ' # Separate input by space
# Run "Verify package contents"
EXPECT=$(cat ./scripts/expected-files.txt)
TAR=$(yarn pack | grep -Eo "/.*tgz")
TARF=$(tar -tf ${TAR})
REJECTED_FILES=0
while read tarFile
do
    VALID=0
    while read pattern
    do
        echo "$tarFile" | grep -Po "^$pattern\$" > /dev/null
        if [ $? -eq 0 ]; then
            # Package file matches a valid pattern
            VALID=1
            break
        fi
    done <<< $EXPECT
    if [ $VALID -ne 1 ]; then
        echo "$tarFile does not match any pattern"
        REJECTED_FILES=$((REJECTED_FILES + 1))
    fi
done <<< $TARF
if [ $REJECTED_FILES -gt 0 ]; then
    echo "Filelist check failed ($REJECTED_FILES item(s) invalid)"
    exit 1
fi
git log -5
