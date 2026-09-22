PYTHONPATH=.

.PHONY: test run js-test compile

test:
	PYTHONPATH=$(PYTHONPATH) pytest -q

js-test:
	node simulations/javascript/test.js

run:
	PYTHONPATH=$(PYTHONPATH) uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

compile:
	python3 -m compileall -q backend simulations/python
