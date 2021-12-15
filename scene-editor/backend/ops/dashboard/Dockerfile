FROM python:3.7 AS development

RUN pip install click==7.1.2
RUN pip install rq-dashboard

EXPOSE 9181

CMD ["rq-dashboard"]