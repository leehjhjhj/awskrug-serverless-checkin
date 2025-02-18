build-CommonLayer:
	mkdir -p "$(ARTIFACTS_DIR)/python"
	pip3 install --platform manylinux2014_x86_64 \
		--implementation cp \
		--python-version 3.11 \
		--only-binary=:all: \
		-r requirements.txt -t "$(ARTIFACTS_DIR)/python"
	cp -r ./* "$(ARTIFACTS_DIR)/python/"