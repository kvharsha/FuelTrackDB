from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_add_last_login"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="is_superuser",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="customuser",
            name="is_staff",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="customuser",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]
