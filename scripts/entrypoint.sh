#!/bin/bash

if [ -n "$DOPPLER_CONFIG" ]; then
  echo "Using Doppler configuration: $DOPPLER_CONFIG"
  exec doppler run -p api-template-project -c $DOPPLER_CONFIG -- bun run start:fly
else
  echo "Running without Doppler"
  exec bun run start:fly
fi