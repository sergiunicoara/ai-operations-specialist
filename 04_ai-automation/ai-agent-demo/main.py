"""CLI entry point."""

import sys

from agent import handle_request


# The entry point is deliberately tiny: it reads the user text and forwards it
# to the agent workflow defined in agent.py.

def main() -> int:
    if len(sys.argv) < 2:
        print("termai is an AI shell assistant.")
        print('Usage: termai "your request"')
        return 1

    user_request = " ".join(sys.argv[1:]).strip()
    if not user_request:
        print("termai is an AI shell assistant.")
        print('Usage: termai "your request"')
        return 1

    response = handle_request(user_request)
    print(response)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
