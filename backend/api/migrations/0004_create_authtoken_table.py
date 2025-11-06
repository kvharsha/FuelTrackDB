from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_add_missing_user_flags"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS `authtoken_token` (
              `key` varchar(40) NOT NULL,
              `user_id` int unsigned NOT NULL,
              `created` datetime NOT NULL,
              PRIMARY KEY (`key`),
              UNIQUE KEY `authtoken_token_user_id_key` (`user_id`),
              CONSTRAINT `authtoken_token_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            reverse_sql="DROP TABLE IF EXISTS `authtoken_token`;",
        ),
    ]
